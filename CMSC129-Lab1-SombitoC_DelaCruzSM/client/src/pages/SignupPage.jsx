import AuthForm from "../components/AuthForm.jsx";

function SignupPage() {
    const handleSignup = (formData) => {
        console.log("Sign Up form submitted with data:", formData)
        // TODO: Implement sign up logic (e.g., API call to backend)
    }

  return (
    <div className='signup-auth-page'>
        <div className='auth-form-container'>
            <AuthForm form="signup" onSubmit={handleSignup} />
        </div>
    </div>
     
  );
}

export default SignupPage