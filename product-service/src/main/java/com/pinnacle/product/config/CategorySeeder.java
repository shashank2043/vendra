package com.pinnacle.product.config;

import com.pinnacle.product.document.Category;
import com.pinnacle.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CategorySeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(CategorySeeder.class);

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            return;
        }
        List<Category> categories = List.of(
                Category.builder().name("Electronics").description("Phones, laptops, gadgets and accessories").imageUrl("https://images.unsplash.com/photo-1498049794561-7780e7231661").build(),
                Category.builder().name("Home").description("Furniture, decor and kitchen essentials").imageUrl("https://images.unsplash.com/photo-1484101403633-562f891dc89a").build(),
                Category.builder().name("Fashion").description("Clothing, footwear and accessories").imageUrl("https://images.unsplash.com/photo-1445205170230-053b83016050").build(),
                Category.builder().name("Books").description("Fiction, non-fiction and academic titles").imageUrl("https://images.unsplash.com/photo-1512820790803-83ca734da794").build(),
                Category.builder().name("Beauty").description("Skincare, makeup and personal care").imageUrl("https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9").build(),
                Category.builder().name("Sports").description("Fitness gear, outdoor and sporting goods").imageUrl("https://images.unsplash.com/photo-1517649763962-0c623066013b").build()
        );
        categoryRepository.saveAll(categories);
        log.info("Seeded {} default categories", categories.size());
    }
}
