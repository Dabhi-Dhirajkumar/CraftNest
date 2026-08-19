from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()

class OTPForgotPasswordTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            email='testuser@gmail.com',
            password='OldPassword123!',
            first_name='Test',
            last_name='User'
        )

    def test_forgot_password_sends_otp(self):
        response = self.client.post(reverse('forgot_password'), {
            'email_or_username': 'testuser@gmail.com'
        })
        self.assertRedirects(response, reverse('verify_otp'))
        self.assertIn('reset_otp', self.client.session)
        self.assertEqual(len(self.client.session['reset_otp']), 6)
        self.assertEqual(self.client.session['reset_email'], 'testuser@gmail.com')

    def test_verify_otp_incorrect_code(self):
        # Trigger forgot password to set session OTP
        self.client.post(reverse('forgot_password'), {'email_or_username': 'testuser@gmail.com'})
        
        # Post wrong OTP
        response = self.client.post(reverse('verify_otp'), {'otp': '000000'})
        self.assertEqual(response.status_code, 200)
        self.assertFalse(self.client.session.get('otp_verified', False))

    def test_verify_otp_correct_code_and_reset_password(self):
        # Trigger forgot password
        self.client.post(reverse('forgot_password'), {'email_or_username': 'testuser@gmail.com'})
        otp = self.client.session['reset_otp']

        # Verify correct OTP
        verify_resp = self.client.post(reverse('verify_otp'), {'otp': otp})
        self.assertRedirects(verify_resp, reverse('password_reset_confirm'))
        self.assertTrue(self.client.session['otp_verified'])

        # Reset password
        reset_resp = self.client.post(reverse('password_reset_confirm'), {
            'new_password': 'NewPassword123!',
            'confirm_password': 'NewPassword123!'
        })
        self.assertRedirects(reset_resp, reverse('password_reset_complete'))

        # Verify new password works
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPassword123!'))

