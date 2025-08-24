export function PharosLogo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
        <span className="text-white font-bold text-xs">PC</span>
      </div>
      <div>
        <div className="text-lg font-semibold leading-none">InvestON</div>
        <div className="text-xs opacity-70">powered by Pharos Capital</div>
      </div>
    </div>
  );
}