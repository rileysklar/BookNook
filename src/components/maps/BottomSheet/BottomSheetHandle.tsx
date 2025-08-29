interface BottomSheetHandleProps {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onClick?: () => void;
}

export default function BottomSheetHandle({ 
  onTouchStart, 
  onTouchMove, 
  onTouchEnd,
  onClick
}: BottomSheetHandleProps) {
  return (
    <div 
      className="flex justify-center pt-3 pb-2 rounded-t-3xl shadow-2xl bg-white cursor-pointer hover:bg-gray-50 transition-colors"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
    >
      <div className="w-12 h-1 bg-gray-400 rounded-full" />
    </div>
  );
}
