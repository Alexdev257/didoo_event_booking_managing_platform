
import React from 'react'
import Header from './Header'
import Footer from './Footer'

export default function DefaultLayout( { children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="p-24">
                {children}
            </main>
            <Footer />
        </div>
    )
}
