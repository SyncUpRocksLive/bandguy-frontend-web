import { LogInfo } from '@/Support/Utilities/Logger';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';

const LoginForm = () => {
	const [newUserName, setNewUserName] = useState('');
	const [newPassword, setNewPassword] = useState('');

	// TODO Share ['login.state'] cache

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
		<div className="Auth-form-container d-flex align-items-center justify-content-center" 
			style={{ 
				minHeight: '100vh',
				background: 'rgba(0, 0, 0, 0.4)' // Darkens the background image slightly for focus
			}}>
			<div className="Auth-form p-5 shadow-lg rounded text-light" 
				style={{ 
					maxWidth: '420px', 
					background: 'rgba(33, 37, 41, 0.85)', // Semi-transparent Charcoal
					backdropFilter: 'blur(10px)',         // The "Frosty" look
					border: '1px solid rgba(255, 255, 255, 0.1)' 
				}}>
				
				<div className="Auth-form-content text-center">
					<h2 className="mb-4 fw-bold tracking-tight" style={{ letterSpacing: '1px' }}>
						SYNC ROCK LIVE ! <span className="text-primary">BETA</span>
					</h2>
					
					<div className="p-3 mb-4 rounded border-0" 
						style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
						<p className="small mb-0 opacity-75">
							🎸 <strong>Welcome to the stage!</strong><br />
							Access is currently restricted to registered beta users.
						</p>
					</div>

					<div className="d-grid gap-3 mt-4">
						<Button 
							variant="primary" 
							size="lg"
							className="py-3 fw-bold border-0"
							style={{ 
								backgroundColor: '#0d6efd', 
								boxShadow: '0 4px 15px rgba(13, 110, 253, 0.3)' 
							}}
							href="/api/auth/login" // can re-route returnUrl=/jam/hello
						>
							Sign In
						</Button>
					</div>

					<div className="mt-5 pt-3 border-top border-secondary opacity-50">
						<p className="x-small mb-0">
							Lets Rock! 🤘
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default LoginForm;
