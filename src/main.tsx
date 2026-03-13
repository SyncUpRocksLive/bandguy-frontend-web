import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './Routes/Layout.tsx';
import SetList from './Components/SetList/SetList.tsx';
import Home from './Routes/Home.tsx'
import { RegisterIconWithLib } from './Constants/AppIcons.ts';
import SetView from './Components/SetList/SetView.tsx';
import './index.css'
import './App.css'
import Guest from './Components/Guest/Guest.tsx';
import { PeerOperationMode } from './Support/Stores/Types.ts';

RegisterIconWithLib();


// Banish any existing service workers (like GoDaddy's)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
            registration.unregister();
            console.log('Successfully evicted rogue service worker.');
        }
    });
}

const router = createBrowserRouter([
	{
		element: <Layout />,
		children: [
			{ path: "/", element: <Home />, },
			// Host
			{ path: "/host/sets", element: <SetList mode={PeerOperationMode.Host} />, },
			{ path: "/host/sets/:setId", element: <SetView mode={PeerOperationMode.Host} />, },
			// Solo
			{ path: "/solo/sets", element: <SetList mode={PeerOperationMode.Solo}/>, },
			{ path: "/solo/sets/:setId", element: <SetView mode={PeerOperationMode.Solo}/>, },
			// Guest
			{ path: "/guest", element: <Guest />, },
			{ path:"*", element: <div>404 - Doesn't Exist. These are not the droids you are looking for!</div>}
		],
	}
]);

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
		</QueryClientProvider>
	</React.StrictMode>,
)
