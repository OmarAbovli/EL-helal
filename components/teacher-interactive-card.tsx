"use client"

import { useState } from 'react';
import Image from 'next/image';

export default function TeacherInteractiveCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4">
      <div className="text-left">
        <h2 className="text-3xl font-bold animate-fade-in-down">The Expert Teacher</h2>
        <p className="mt-4 text-lg text-slate-600 animate-fade-in-up">Mr. Tamer Helal, with 30 years of experience, makes learning English an enjoyable and seamless journey. Our platform is designed to save you time and enhance your focus.</p>
        <div className="mt-6 space-y-2">
          <p className="font-semibold animate-fade-in-left">- Save time, boost focus.</p>
          <p className="font-semibold animate-fade-in-left animation-delay-200">- Your success is our mission.</p>
          <p className="font-semibold animate-fade-in-left animation-delay-400">- English, simplified.</p>
        </div>
      </div>
      <div
        className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-500 hover:scale-105 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsHovered(!isHovered)}
      >
        {/* Default Image (Avatar) */}
        <img
          src="/teacher-avatar.png"
          alt="Tamer Helal Avatar"
          className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out absolute inset-0 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
        />

        {/* Hover Image (Portrait) */}
        <img
          src="/teacher-portrait.png"
          alt="Tamer Helal Portrait"
          className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out absolute inset-0 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      <style jsx>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out forwards;
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }

        @keyframes fade-in-left {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-left {
          animation: fade-in-left 0.5s ease-out forwards;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}
