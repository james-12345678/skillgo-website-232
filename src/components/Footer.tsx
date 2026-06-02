import { Link } from "react-router-dom";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className="relative border-t border-blue-800 py-12 bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: 'url("https://cdn.builder.io/api/v1/image/assets%2F945c9498045d46559ef5d9406b9ff3a5%2Fae2df40d89434ca2a16838355c345107?format=webp&width=1920")' }}
    >
      {/* Semi-transparent overlay for contrast */}
      <div className="absolute inset-0 bg-blue-950/85 backdrop-blur-xs z-0" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-logo-gold font-semibold mb-4">© 2026 SkillGo</p>
            <p className="text-logo-gold/80 mb-6">Verified skills for the skills first economy</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <Link to="/about" onClick={scrollToTop} className="text-sm sm:text-base text-logo-gold/80 hover:text-logo-gold transition-colors">
              About
            </Link>
            <Link to="/mission" onClick={scrollToTop} className="text-sm sm:text-base text-logo-gold/80 hover:text-logo-gold transition-colors">
              Mission
            </Link>
            <Link to="/vision" onClick={scrollToTop} className="text-sm sm:text-base text-logo-gold/80 hover:text-logo-gold transition-colors">
              Vision
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
