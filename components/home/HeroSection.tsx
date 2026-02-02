// components/HeroSectionAspectRatio.tsx
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const HeroSectionAspectRatio = ({
}) => {
  const aspectRatioClasses = {
    '16:9': 'aspect-video', // 16:9
    '4:3': 'aspect-4/3',    // 4:3
    '3:2': 'aspect-3/2',    // 3:2
    '1:1': 'aspect-square', // 1:1
  };

  return (
    <section className="relative w-full overflow-hidden">
      <div className={`relative ${aspectRatioClasses["16:9"]}`}>
        <Link href={"/products"}>
        <Image
          src={"/bg.png"}
          alt={"Mega Prize Mall"}
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          className="object-cover"
          style={{
            objectPosition: 'center',
          }}
          />
          </Link>
        
        {/* Gradient overlay for better text visibility */}
        
      </div>
    </section>
  );
};

export default HeroSectionAspectRatio;