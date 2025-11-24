import React, { useRef } from 'react';
import { X } from 'lucide-react';

interface MultiImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 8,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isSizeValid = file.size <= 10 * 1024 * 1024; // 10MB
        return isImage && isSizeValid;
      });

      if (images.length + validFiles.length > maxImages) {
        alert(`Você só pode enviar até ${maxImages} imagens.`);
        const remainingSlots = maxImages - images.length;
        onImagesChange([...images, ...validFiles.slice(0, remainingSlots)]);
      } else {
        onImagesChange([...images, ...validFiles]);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  return (
    <div className="multi-image-upload">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,image/gif"
        multiple
        style={{ display: 'none' }}
        disabled={disabled}
      />

      <div className="image-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
        gap: '8px',
        marginTop: images.length > 0 ? '12px' : '0'
      }}>
        {images.map((file, index) => (
          <div key={index} className="image-preview" style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden' }}>
            <img 
              src={URL.createObjectURL(file)} 
              alt={`Preview ${index}`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <X size={12} />
            </button>
          </div>
        ))}
        
      </div>
    </div>
  );
};
