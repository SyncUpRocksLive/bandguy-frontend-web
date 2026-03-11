import { LogInfo } from '@/Support/Utilities/Logger';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';

const LoginForm = () => {
	const [newUserName, setNewUserName] = useState('');
	const [newPassword, setNewPassword] = useState('');

	const login = async () => {
		const response = await fetch(`/api/user/login`, { 
			method: "POST", 
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username: newUserName, password: newPassword })
		});

		if (response.ok) {
			LogInfo('User Logged In - redirecting to root');
			window.location.assign('/');
		}
	};

	return (
		<div className="Auth-form-container">
			<form className="Auth-form">
				<div className="Auth-form-content">
					<h3 className="Auth-form-title">Sign In</h3>
					<div className="form-group mt-3">
						<label>Email address</label>
						<input type="email" className="form-control mt-1" placeholder="Enter email" value={newUserName} onChange={(e) => setNewUserName(e.target.value)}/>
					</div>
					<div className="form-group mt-3">
						<label>Password</label>
						<input type="password" className="form-control mt-1" placeholder="Enter password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
					</div>
					<div className="d-grid gap-2 mt-3"> 
						<Button variant='primary' type='submit' onClick={(e) => {
							e.preventDefault();

							if (newUserName.length > 0 && newPassword.length > 0) {
								login();
							} else {
								alert('Please enter both email and password');
							}
						}}>Submit</Button>
					</div>
					<div className="row">
						<div className="col-sm">
							Forgot <a href="#">password?</a>
						</div>
						<div className="col-sm-auto">
							<a href="#">Create Account</a>
						</div>
					</div>
				</div>
			</form>
		</div>
	)
}

export default LoginForm;
