
import React from 'react';
import { Code, Github } from 'lucide-react';

const Header = () => {
  return (
    <header className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Code className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">DNS Importer Pro</h1>
            <p className="text-sm text-muted-foreground">Importe registros DNS do BIND para a Azion</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <a 
            href="https://github.com/aziontech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
          <a 
            href="https://www.azion.com/documentation/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Documentação
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
