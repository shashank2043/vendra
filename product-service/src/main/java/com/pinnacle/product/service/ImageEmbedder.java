package com.pinnacle.product.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

/**
 * Fetches remote image URLs server-side and inlines them as data URIs so product images
 * display reliably in the browser regardless of hotlink protection, CORS, or client proxies.
 * Best-effort: if a URL can't be fetched (blocked / non-image / too large), the original
 * value is kept untouched.
 */
@Component
public class ImageEmbedder {

    private static final Logger log = LoggerFactory.getLogger(ImageEmbedder.class);
    private static final long MAX_BYTES = 4_000_000; // 4 MB cap per image

    private final HttpClient http = buildClient();

    // Corporate proxies (e.g. Zscaler) re-sign TLS with a root CA that isn't in the JDK
    // truststore, causing PKIX failures on outbound HTTPS. This client trusts all certs so
    // product images can be fetched through such proxies. Scope is limited to image fetching.
    private static HttpClient buildClient() {
        try {
            TrustManager[] trustAll = new TrustManager[]{
                new X509TrustManager() {
                    public void checkClientTrusted(X509Certificate[] chain, String authType) { }
                    public void checkServerTrusted(X509Certificate[] chain, String authType) { }
                    public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                }
            };
            SSLContext ssl = SSLContext.getInstance("TLS");
            ssl.init(null, trustAll, new SecureRandom());
            return HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(5))
                    .followRedirects(HttpClient.Redirect.NORMAL)
                    .sslContext(ssl)
                    .build();
        } catch (Exception e) {
            return HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(5))
                    .followRedirects(HttpClient.Redirect.NORMAL)
                    .build();
        }
    }

    public List<String> embedAll(List<String> values) {
        if (values == null) {
            return null;
        }
        List<String> out = new ArrayList<>(values.size());
        for (String v : values) {
            out.add(embed(v));
        }
        return out;
    }

    public String embed(String src) {
        if (src == null || src.isBlank()) {
            return src;
        }
        String s = src.trim();
        if (s.startsWith("data:")) {
            return s; // already embedded (uploaded image)
        }
        if (!s.startsWith("http://") && !s.startsWith("https://")) {
            return s;
        }
        try {
            HttpRequest req = HttpRequest.newBuilder(URI.create(s))
                    .timeout(Duration.ofSeconds(7))
                    .header("User-Agent", "Mozilla/5.0 (compatible; VendraBot/1.0)")
                    .header("Accept", "image/*")
                    .GET()
                    .build();
            HttpResponse<byte[]> resp = http.send(req, HttpResponse.BodyHandlers.ofByteArray());
            if (resp.statusCode() != 200) {
                log.warn("Image fetch {} returned HTTP {}; keeping original link", s, resp.statusCode());
                return s;
            }
            String contentType = resp.headers().firstValue("content-type").orElse("").toLowerCase();
            if (!contentType.startsWith("image/")) {
                log.warn("URL {} is not an image (content-type={}); keeping original link", s, contentType);
                return s;
            }
            byte[] body = resp.body();
            if (body == null || body.length == 0 || body.length > MAX_BYTES) {
                return s;
            }
            String base64 = Base64.getEncoder().encodeToString(body);
            return "data:" + contentType + ";base64," + base64;
        } catch (Exception e) {
            log.warn("Could not embed image {}: {}", s, e.getMessage());
            return s; // best effort
        }
    }
}
