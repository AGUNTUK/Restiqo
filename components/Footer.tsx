import Link from "next/link";
import { type dictionaries } from "@/lib/i18n/dictionaries";

export default function Footer({ dict, locale }: { dict: typeof dictionaries["en"]; locale: string }) {
  const footerLinksArr = [
    {
      heading: dict.footer.explore,
      links: [
        { href: "/listings", label: dict.footer.browseListings },
        { href: "/listings?type=villa", label: dict.footer.villas },
        { href: "/listings?type=apartment", label: dict.footer.apartments },
      ],
    },
    {
      heading: dict.footer.company,
      links: [
        { href: "#", label: dict.footer.aboutUs },
        { href: "#", label: dict.footer.careers },
        { href: "/blog", label: dict.footer.blog },
      ],
    },
    {
      heading: dict.common.popularDest,
      links: [
        { href: "/dhaka", label: dict.search.cities.dhaka },
        { href: "/coxs-bazar", label: dict.search.cities.coxsBazar },
        { href: "/sylhet", label: dict.search.cities.sylhet },
        { href: "/sajek", label: dict.search.cities.sajek },
      ],
    },
    {
      heading: dict.footer.support,
      links: [
        { href: "#", label: dict.footer.helpCenter },
        { href: "#", label: dict.footer.privacy },
        { href: "#", label: dict.footer.terms },
      ],
    },
  ];

  return (
    <footer
      style={{
        background: "var(--bg)",
        borderTop: "1px solid #dde2e7",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "3rem 1.5rem 1.5rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "2rem",
            marginBottom: "2.5rem",
          }}
        >
          {/* Brand column */}
          <div>
            <Link
              href="/"
              style={{
                fontWeight: 800,
                fontSize: "1.3rem",
                color: "var(--primary)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                marginBottom: "0.75rem",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: "linear-gradient(135deg, var(--primary), var(--accent))",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                }}
              >
                🏠
              </span>
              Restiqa
            </Link>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.88rem",
                lineHeight: 1.6,
                marginBottom: "1rem",
              }}
            >
              {dict.footer.about}
            </p>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              {["𝕏", "f", "in"].map((icon) => (
                <button
                  key={icon}
                  className="neo-btn"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--primary)",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinksArr.map(({ heading, links }) => (
            <div key={heading}>
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-muted)",
                  marginBottom: "0.9rem",
                }}
              >
                {heading}
              </h3>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {links.map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="footer-link"
                      style={{
                        color: "var(--text)",
                        textDecoration: "none",
                        fontSize: "0.92rem",
                        transition: "color 0.2s",
                      }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid #dde2e7",
            paddingTop: "1.2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.83rem" }} suppressHydrationWarning>
            © {new Date().getFullYear()} Restiqa. {dict.footer.rights}
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.83rem" }}>
            {dict.footer.builtWith}
          </p>
        </div>
      </div>
    </footer>
  );
}
