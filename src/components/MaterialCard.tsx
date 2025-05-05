import { Material } from '@/types';
import { formatFileSize } from '@/lib/utils';

interface MaterialCardProps {
  material: Material;
}

export default function MaterialCard({ material }: MaterialCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{material.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{material.description}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {material.category}
          </span>
          <span>{new Date(material.uploadDate).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {formatFileSize(material.fileSize)}
          </span>
          <a 
            href={material.fileUrl} 
            download
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            下载
          </a>
        </div>
      </div>
    </div>
  );
}