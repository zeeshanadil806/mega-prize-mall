import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative aspect-video">
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
      </div>
    </section>
  );
};

export default HeroSection;
