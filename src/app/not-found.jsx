// pages/404.js
"use client";
import Link from 'next/link';

const Custom404 = () => {
    return (
        <>
            <head>
                <title>Page Not Found - 404 Error | ilmulQuran Online Academy</title>
                <meta
                    name="description"
                    content="Oops! The page you’re looking for doesn’t exist. Please check the URL or return to the homepage of ilmulQuran Online Academy."
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            
            <div className="flex flex-col items-center justify-start min-h-screen bg-teal-50 text-center pt-20 px-4">
                <h1 className="text-4xl sm:text-6xl md:text-9xl font-bold text-teal-700">404</h1>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-teal-800">Page Not Found</h2>
                <p className="mt-2 text-sm sm:text-base md:text-lg text-teal-600">
                    Sorry, the page you are looking for does not exist.
                </p>
                <Link href="/" className="mt-4 px-4 py-2 text-white bg-teal-500 rounded hover:bg-teal-600 transition duration-300">
                    Go to Home
                </Link>
            </div>
        </>
    );
};

export default Custom404;
