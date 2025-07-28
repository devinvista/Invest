export function PharosLogo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-xs">PC</span>
      </div>
      <div className="text-foreground">
        <div className="text-lg font-semibold leading-none">OrçaFácil</div>
        <div className="text-xs text-muted-foreground">powered by Pharos Capital</div>
      </div>
    </div>
  );
}