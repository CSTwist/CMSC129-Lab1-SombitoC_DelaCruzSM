import AuthForm from "../components/AuthForm.jsx";

function LoginPage() {
    const handleLogin = (formData) => {
        console.log("Login form submitted with data:", formData)
        // TODO: Implement login logic (e.g., API call to backend)
    }

  return (
    <div className='login-auth-page'>
        <div className='auth-form-container'>
            <AuthForm form="login" onSubmit={handleLogin} />
        </div>
    </div>
     
  );
}

export default LoginPage