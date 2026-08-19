from django import forms
from django.contrib.auth import get_user_model
from crafts.models import UserProfile, Review, ContactUs, Country, State, City, HandmadeProduct, ProductCategory

User = get_user_model()

class StyledFormMixin:
    """Helper mixin to automatically add css classes to form fields."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            # Apply styling class
            existing_classes = field.widget.attrs.get('class', '')
            field.widget.attrs['class'] = f"{existing_classes} form-control".strip()
            field.widget.attrs['placeholder'] = field.label

class RegisterForm(StyledFormMixin, forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Password'}))
    confirm_password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Confirm Password'}))

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'profile_image', 'role']

    # Role selection (User or Seller)
    ROLE_CHOICES = [
        ('user', 'User'),
        ('seller', 'Seller'),
    ]
    role = forms.ChoiceField(
        choices=ROLE_CHOICES,
        widget=forms.Select(attrs={'class': 'form-control'}),
        label='Account Type',
        initial='user',
    )

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("A user with this email address already exists.")
        return email

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("password")
        confirm_password = cleaned_data.get("confirm_password")

        if password != confirm_password:
            raise forms.ValidationError("Passwords do not match.")
        return cleaned_data

class UserProfileForm(StyledFormMixin, forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['address', 'phone_no', 'image', 'country', 'state', 'city']
        widgets = {
            'address': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Full Shipping Address'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Initialize location choices dynamically or set defaults
        self.fields['state'].queryset = State.objects.none()
        self.fields['city'].queryset = City.objects.none()

        if 'country' in self.data:
            try:
                country_id = int(self.data.get('country'))
                self.fields['state'].queryset = State.objects.filter(country_id=country_id).order_by('name')
            except (ValueError, TypeError):
                pass
        elif self.instance.pk and self.instance.country:
            self.fields['state'].queryset = self.instance.country.states.all().order_by('name')

        if 'state' in self.data:
            try:
                state_id = int(self.data.get('state'))
                self.fields['city'].queryset = City.objects.filter(state_id=state_id).order_by('name')
            except (ValueError, TypeError):
                pass
        elif self.instance.pk and self.instance.state:
            self.fields['city'].queryset = self.instance.state.cities.all().order_by('name')

class ReviewForm(StyledFormMixin, forms.ModelForm):
    rating = forms.ChoiceField(
        choices=[(i, f"{i} Star{'s' if i > 1 else ''}") for i in range(1, 6)],
        widget=forms.Select(attrs={'class': 'form-select'})
    )

    class Meta:
        model = Review
        fields = ['rating', 'comment']
        widgets = {
            'comment': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Share your experience with this handmade product...'}),
        }

class ContactUsForm(StyledFormMixin, forms.ModelForm):
    class Meta:
        model = ContactUs
        fields = ['name', 'email', 'subject', 'message', 'phone']
        widgets = {
            'message': forms.Textarea(attrs={'rows': 4, 'placeholder': 'Type your message here...'}),
        }

class ForgotPasswordForm(StyledFormMixin, forms.Form):
    email_or_username = forms.CharField(
        label="Username or Email Address",
        widget=forms.TextInput(attrs={'placeholder': 'Enter registered username or email', 'autofocus': 'autofocus'})
    )

    def clean_email_or_username(self):
        val = self.cleaned_data.get('email_or_username', '').strip()
        if not val:
            raise forms.ValidationError("Please enter your username or email address.")
        return val

class VerifyOTPForm(StyledFormMixin, forms.Form):
    otp = forms.CharField(
        label="6-Digit OTP Code",
        max_length=6,
        min_length=6,
        widget=forms.TextInput(attrs={
            'placeholder': '• • • • • •',
            'autofocus': 'autofocus',
            'maxlength': '6',
            'pattern': '[0-9]{6}',
            'inputmode': 'numeric',
            'style': 'letter-spacing: 0.5rem; text-align: center; font-size: 1.25rem; font-weight: 700;'
        })
    )

    def clean_otp(self):
        otp = self.cleaned_data.get('otp', '').strip()
        if not otp.isdigit() or len(otp) != 6:
            raise forms.ValidationError("Please enter a valid 6-digit numeric OTP code.")
        return otp

class ResetPasswordForm(StyledFormMixin, forms.Form):
    new_password = forms.CharField(
        label="New Password",
        widget=forms.PasswordInput(attrs={'placeholder': 'Enter new password', 'id': 'id_new_password'})
    )
    confirm_password = forms.CharField(
        label="Confirm New Password",
        widget=forms.PasswordInput(attrs={'placeholder': 'Confirm new password', 'id': 'id_confirm_password'})
    )

    def clean_new_password(self):
        password = self.cleaned_data.get('new_password')
        if len(password) < 6:
            raise forms.ValidationError("Password must be at least 6 characters long.")
        return password

    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get("new_password")
        confirm_password = cleaned_data.get("confirm_password")

        if password and confirm_password and password != confirm_password:
            raise forms.ValidationError("Passwords do not match. Please re-enter.")
        return cleaned_data


class HandmadeProductForm(StyledFormMixin, forms.ModelForm):
    class Meta:
        model = HandmadeProduct
        fields = ['category', 'product_name', 'description', 'price', 'stock', 'material', 'image']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4, 'placeholder': 'Describe your handmade product...'}),
        }



