import Link from "next/link";


export default function Footer() {
    return  ( <footer className="bg-gray-900 text-border-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-serif text-white mb-4">Barta</h3>
              <p className="text-sm">Your trusted partner in legal solutions</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Contact</h4>
              <p className="text-sm">Email: executive@Barta.xyz</p>
              <p className="text-sm">Phone: +8801311962091</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Address</h4>
              <p className="text-sm">123 Legal Street</p>
              <p className="text-sm">Dhaka, Bangladesh</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <Link href="#" className="hover:text-white">Twitter</Link>
                <Link href="#" className="hover:text-white">LinkedIn</Link>
                <Link href="#" className="hover:text-white">Facebook</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>);
}