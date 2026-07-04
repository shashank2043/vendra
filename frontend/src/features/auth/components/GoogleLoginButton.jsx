import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAppDispatch } from '../../../app/hooks';
import { loginWithGoogle } from '../authSlice';
import { toast } from 'react-toastify';

const GoogleLoginButton = () => {
  const dispatch = useAppDispatch();

  const handleSuccess = (credentialResponse) => {
    if (credentialResponse.credential) {
      dispatch(loginWithGoogle(credentialResponse.credential))
        .unwrap()
        .then((data) => {
          toast.success(`Welcome back, ${data.user.name}!`);
        })
        .catch((error) => {
          toast.error(error || 'Google login failed');
        });
    } else {
      toast.error('No credentials returned from Google');
    }
  };

  const handleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '12px 0' }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        theme="outline"
        shape="rectangular"
      />
    </div>
  );
};

export default GoogleLoginButton;
