import { useCarousel } from '../hooks/useCarousel'

interface CarouselProps {
  images: string[]
  id?: string
  overlay?: React.ReactNode
  slideHeight?: string
  imagePositions?: Record<number, string>
}

export default function Carousel({ images, id = 'carousel', overlay, slideHeight, imagePositions }: CarouselProps) {
  const { current, handlePrev, handleNext, total } = useCarousel(images.length)

  if (!images.length) return null

  return (
    <div className="carousel" id={id}>
      <div className="carousel-viewport">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((src, i) => (
            <div
              className="carousel-slide"
              key={i}
              style={slideHeight ? { height: slideHeight } : undefined}
            >
              <img
                src={src}
                alt={`Slide ${i + 1}`}
                style={imagePositions?.[i] ? { objectPosition: imagePositions[i] } : undefined}
                {...(imagePositions?.[i] ? { 'data-custom-position': '1' } : {})}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="carousel-overlay" />
      {overlay}
      <button className="carousel-arrow carousel-prev" aria-label="Previous" onClick={handlePrev}>&#8592;</button>
      <button className="carousel-arrow carousel-next" aria-label="Next" onClick={handleNext}>&#8594;</button>
      <div className="carousel-counter">
        <span className="carousel-current">{current + 1}</span> / <span className="carousel-total">{total}</span>
      </div>
    </div>
  )
}
