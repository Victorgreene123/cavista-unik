import React from 'react';
import NavbarIndividual from '../components/layout/Navbars/navbar_individual';

export default function IndividualLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
        <div>
            <NavbarIndividual />
            {children}
        </div>
        </>
    );
}