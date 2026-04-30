import { Link } from 'react-router-dom';

export default function HomePage() {
    const heroBannerImageUrl =
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1600&q=90';

    return (
        <div className="hero">
            <img className="hero-img" src={heroBannerImageUrl} alt="New arrivals" />
            <div className="hero-overlay">
                <div className="hero-copy">
                    <p className="hero-kicker">New Arrivals</p>
                    <h1 className="hero-title">Bags</h1>
                    <div className="hero-links">
                        <Link to="/products?category=Women">Women</Link>
                        <Link to="/products?category=Men">Men</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
