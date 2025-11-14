/**
 * Modal para crop de imagens
 * Permite ao usuário fazer crop de imagens de avatar e banner
 */
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, RotateCcw } from 'lucide-react';
import type { Area, Point } from 'react-easy-crop';
import styles from '../../styles/ImageCropModal.module.css';

/**
 * Props do modal de crop
 */
interface ImageCropModalProps {
  /** Indica se o modal está aberto */
  isOpen: boolean;
  /** Imagem a ser cortada */
  image: string | null;
  /** Aspect ratio do crop (largura/altura) */
  aspect: number;
  /** Callback chamado quando o crop é confirmado */
  onCropComplete: (croppedImage: string) => void;
  /** Callback chamado para fechar o modal */
  onClose: () => void;
  /** Título do modal */
  title: string;
}

/**
 * Modal para crop de imagens com preview em tempo real
 */
export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  image,
  aspect,
  onCropComplete,
  onClose,
  title
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Handler para mudança do crop
   */
  const onCropChange = useCallback((crop: Point) => {
    setCrop(crop);
  }, []);

  /**
   * Handler para mudança do zoom
   */
  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  /**
   * Handler para mudança da rotação
   */
  const onRotationChange = useCallback((rotation: number) => {
    setRotation(rotation);
  }, []);

  /**
   * Handler quando o crop está completo
   */
  const onCropAreaChange = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  /**
   * Cria imagem cortada a partir da área selecionada
   */
  const createCroppedImage = useCallback(async (): Promise<string> => {
    if (!image || !croppedAreaPixels) {
      throw new Error('Imagem ou área de crop não disponível');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Não foi possível criar contexto do canvas');
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
      img.onload = () => {
        // Configurar canvas com tamanho do crop
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        // Aplicar rotação se necessário
        if (rotation !== 0) {
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
        }

        // Desenhar imagem cortada
        ctx.drawImage(
          img,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        if (rotation !== 0) {
          ctx.restore();
        }

        // Converter para base64
        const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
        resolve(croppedImage);
      };

      img.onerror = () => {
        reject(new Error('Erro ao carregar imagem'));
      };

      img.src = image;
    });
  }, [image, croppedAreaPixels, rotation]);

  /**
   * Handler para confirmar o crop
   */
  const handleConfirmCrop = useCallback(async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await createCroppedImage();
      onCropComplete(croppedImage);
      onClose();
    } catch (error) {
      console.error('Erro ao processar crop:', error);
      alert('Erro ao processar imagem. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  }, [croppedAreaPixels, createCroppedImage, onCropComplete, onClose]);

  /**
   * Handler para resetar rotação
   */
  const handleResetRotation = useCallback(() => {
    setRotation(0);
  }, []);

  // Resetar estado quando modal abre
  React.useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setRotation(0);
      setZoom(1);
      setCroppedAreaPixels(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen || !image) return null;

  return (
    <div className={styles['image-crop-modal-overlay']}>
      <div className={styles['image-crop-modal']}>
        <div className={styles['image-crop-modal-header']}>
          <h3 className={styles['image-crop-modal-title']}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className={styles['image-crop-modal-close']}
            disabled={isProcessing}
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles['image-crop-modal-content']}>
          <div className={styles['image-crop-container']}>
            <Cropper
              image={image}
              crop={crop}
              rotation={rotation}
              zoom={zoom}
              aspect={aspect}
              onCropChange={onCropChange}
              onRotationChange={onRotationChange}
              onCropComplete={onCropAreaChange}
              onZoomChange={onZoomChange}
              cropShape="rect"
              showGrid={false}
            />
          </div>

          <div className={styles['image-crop-controls']}>
            <div className={styles['image-crop-control-group']}>
              <label htmlFor="zoom">Zoom:</label>
              <input
                id="zoom"
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className={styles['image-crop-slider']}
              />
              <span className={styles['image-crop-value']}>{zoom.toFixed(1)}x</span>
            </div>

            <div className={styles['image-crop-control-group']}>
              <label htmlFor="rotation">Rotação:</label>
              <input
                id="rotation"
                type="range"
                min={-180}
                max={180}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className={styles['image-crop-slider']}
              />
              <span className={styles['image-crop-value']}>{rotation}°</span>
              <button
                type="button"
                onClick={handleResetRotation}
                className={styles['image-crop-reset-btn']}
                title="Resetar rotação"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles['image-crop-modal-footer']}>
          <button
            type="button"
            onClick={onClose}
            className={styles['image-crop-btn-secondary']}
            disabled={isProcessing}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmCrop}
            className={styles['image-crop-btn-primary']}
            disabled={isProcessing || !croppedAreaPixels}
          >
            {isProcessing ? 'Processando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};
