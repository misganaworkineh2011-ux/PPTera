"use client";

interface TestimonialsSectionProps {
  t: any;
}

export function TestimonialsSection({ t }: TestimonialsSectionProps) {
  return (
    <section className="py-32 lg:py-40 px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Quote Icon - Big */}
        <div className="mb-12">
          <svg width="80" height="60" viewBox="0 0 64 48" fill="none" className="text-cyan-400">
            <path d="M0 48V28.8C0 20.8 1.6 14.4 4.8 9.6C8 4.8 13.6 1.6 21.6 0L24 8C19.2 9.6 16 12 14.4 15.2C12.8 18.4 12 22.4 12 27.2H24V48H0ZM40 48V28.8C40 20.8 41.6 14.4 44.8 9.6C48 4.8 53.6 1.6 61.6 0L64 8C59.2 9.6 56 12 54.4 15.2C52.8 18.4 52 22.4 52 27.2H64V48H40Z" fill="currentColor"/>
          </svg>
        </div>

        {/* Quote - Very Big with extra thick stroke */}
        <div className="grid lg:grid-cols-[3fr_1fr] gap-16 items-start">
          <blockquote 
            className="text-[2.5rem] leading-[1.2] font-black text-white lg:text-[3.5rem] xl:text-[4rem]"
            style={{ 
              WebkitTextStroke: '1.5px currentColor',
              paintOrder: 'stroke fill'
            }}
          >
            {t.testimonialQuote || "Nearly Everything you need for PPT is found in PPTera."}
          </blockquote>

          <div className="flex items-center gap-4 lg:justify-end">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-cyan-300">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
                <span className="text-lg font-medium text-slate-200">Canvelete</span>
              </div>
              <div className="flex items-center gap-4">
                <img 
                  src="https://res.cloudinary.com/di76ibrro/image/upload/v1767963267/images_xeeoky.jpg" 
                  alt="Amanuel Garomsa"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <p className="text-xl font-semibold text-white">Amanuel Garomsa</p>
                  <p className="text-lg text-slate-500">CEO of Canvelete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
