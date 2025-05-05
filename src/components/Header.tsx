import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold site-title">
            NextPPT
          </Link>
          
          <nav className="flex items-center space-x-4">
            <Link href="/" className="hover:text-blue-600">
              首页
            </Link>
            <Link 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              教师入口
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}