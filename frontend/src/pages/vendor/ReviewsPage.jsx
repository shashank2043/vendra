import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Avatar, Stack, Skeleton, Divider } from '@mui/material';
import { MessageSquare } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchVendorReviews, postReply } from '../../features/vendor/reviews/reviewSlice';
import axiosInstance from '../../api/axiosInstance';
import Rating from '../../components/common/Rating';
import EmptyState from '../../components/common/EmptyState';
import { toast } from 'react-toastify';

const ReviewCard = ({ review, onReplySubmit }) => {
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [productName, setProductName] = useState('Handcrafted Item');

  useEffect(() => {
    let active = true;
    if (review.productId) {
      axiosInstance.get(`/products/${review.productId}`)
        .then(res => {
          if (active && res.data) {
            setProductName(res.data.name);
          }
        })
        .catch(() => {});
    }
    return () => { active = false; };
  }, [review.productId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmitting(true);
    onReplySubmit(review.id, replyText.trim())
      .then(() => {
        setReplyText('');
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <Card sx={{ border: '1px solid #E5E7EB', boxShadow: 'none', mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, fontSize: '0.9rem' }}>
                {review.userName ? review.userName.charAt(0) : 'C'}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={700} color="primary.main">
                  {review.userName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reviewed: <strong>{productName}</strong> &bull; {new Date(review.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Stack>
            <Rating value={review.rating} readOnly size="small" />
          </Box>

          {/* Comment */}
          <Typography variant="body2" color="text.primary" sx={{ pl: 0.5, lineHeight: 1.6 }}>
            "{review.comment}"
          </Typography>

          <Divider />

          {/* Reply Block */}
          {review.reply ? (
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#FBFBFA', borderLeft: '3.5px solid', borderColor: 'secondary.main' }}>
              <Typography variant="caption" fontWeight={750} color="secondary.dark" sx={{ display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Shop Reply
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {review.reply}
              </Typography>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                size="small"
                label="Respond to customer review"
                placeholder="Thank you for your feedback..."
                fullWidth
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={submitting}
              />
              <Button
                variant="contained"
                type="submit"
                disabled={!replyText.trim() || submitting}
                sx={{ borderRadius: '20px', px: 3, flexShrink: 0, py: 1 }}
              >
                Reply
              </Button>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

const ReviewsPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { reviews, loading } = useAppSelector((state) => state.vendorReviews);
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    if (!user) return;
    axiosInstance.get(`/vendorProfiles?userId=${user.id}`)
      .then(res => {
        if (res.data && res.data.length > 0) {
          const v = res.data[0];
          setVendor(v);
          dispatch(fetchVendorReviews(v.id));
        }
      });
  }, [dispatch, user]);

  const handleReplySubmit = async (reviewId, replyText) => {
    try {
      await dispatch(postReply({ reviewId, reply: replyText })).unwrap();
      toast.success('Reply submitted successfully!');
    } catch (err) {
      toast.error('Failed to post reply.');
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width="200px" height="40px" sx={{ mb: 2 }} />
        <Stack spacing={3}>
          {Array.from(new Array(3)).map((_, idx) => (
            <Skeleton key={idx} variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={850} color="primary.main" sx={{ letterSpacing: '-0.02em' }}>
          Customer Reviews
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track shopper ratings, respond to feedback, and analyze quality satisfaction.
        </Typography>
      </Box>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews received"
          description="Your products don't have any reviews yet. Customer feedback will appear here."
        />
      ) : (
        <Box>
          {reviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              onReplySubmit={handleReplySubmit} 
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ReviewsPage;
