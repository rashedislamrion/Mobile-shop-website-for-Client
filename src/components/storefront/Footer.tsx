import Link from "next/link";
import { Phone, Mail, MessageSquare, MapPin } from "lucide-react";
import { mockBranches } from "@/lib/mock-data/branches";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Column 1 */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">SUPPORT</h3>
            <ul className="space-y-6">
              <li className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-primary shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Call Us (10am - 8pm)</div>
                  <div className="text-sm font-semibold text-white">+880 1234 567890</div>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-primary shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Email Us</div>
                  <div className="text-sm font-semibold text-white">support@novamobile.com</div>
                </div>
              </li>
              <li>
                <Link href="#" className="flex items-center gap-2 text-sm hover:text-white transition-colors group">
                  <MessageSquare className="w-4 h-4 group-hover:text-primary transition-colors" /> 
                  <span>Live Chat</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-white transition-colors">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">ABOUT US</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">QUICK LINKS</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/category/all" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blogs</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Warranty Policy</Link></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">BRANCHES</h3>
            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
              {mockBranches.map(branch => (
                <div key={branch.id} className="flex gap-4">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">{branch.name}</div>
                    <div className="text-xs text-slate-400 whitespace-pre-line leading-relaxed">{branch.address}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-slate-950 border-t border-slate-800/50">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            © 2026 All Rights Reserved By NovaMobile
          </p>
          <div className="flex items-center gap-8 text-sm text-slate-400">
            <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-500"/> +880 1234 567890</span>
            <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-500"/> info@novamobile.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
