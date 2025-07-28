export function BTGLogo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-sm">BTG</span>
      </div>
      <div className="text-foreground">
        <div className="text-lg font-semibold leading-none">OrçaFácil</div>
        <div className="text-xs text-muted-foreground">powered by BTG Pactual</div>
      </div>
    </div>
  );
}