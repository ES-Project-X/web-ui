'use client';
import Cookies from 'js-cookie';
import { useEffect } from "react";
import { redirect } from 'next/navigation';

export default function Root() {

    useEffect(() => {
      const params = new URLSearchParams(window.location.href);
      const access_token = params.get('access_token');
  
      if (Cookies.get('COGNITO_TOKEN')) {
        redirect('/map');
      }
      if (access_token) {
        const expirationDate = new Date(new Date().getTime() + 3600 * 1000);
        Cookies.set('COGNITO_TOKEN', access_token, { secure: true, expires: expirationDate });
      }
      redirect('/map');
    }, [])

    return (
        <main className="flex min-h-screen flex-col items-center justify-center">
            <div className="z-10 h-full w-full items-center justify-center font-mono text-sm lg:flex">
                <div className='flex items-center'>
                    <div className='flex ml-auto'>
                        <div style={{ borderTopColor: "transparent" }}
                            className="w-16 h-16 border-8 border-black dark:border-white border-dotted rounded-full animate-spin">
                        </div>
                    </div>
                    <span className='ml-4 font-bold text-2xl mr-auto'>
                        Redirecting...
                    </span>
                </div>
            </div>
        </main >
    )
}
