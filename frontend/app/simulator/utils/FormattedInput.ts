export function formatInput(inputText: string): string {
  if (!inputText || inputText.trim() === "") {
    return "Nenhuma entrada disponível";
  }

  let formattedOutput = "";
  
  // Extrair informações do MATPOWER
  const functionMatch = inputText.match(/function\s+(\w+)\s*=\s*(\w+)/);
  const baseMVAMatch = inputText.match(/mpc\.baseMVA\s*=\s*([\d.]+)/);
  const versionMatch = inputText.match(/mpc\.version\s*=\s*'([^']+)'/);
  
  const functionName = functionMatch ? functionMatch[2] : "N/A";
  const baseMVA = baseMVAMatch ? baseMVAMatch[1] : "N/A";
  const version = versionMatch ? versionMatch[1] : "N/A";

  // Contar barras, geradores e linhas
  const busMatch = inputText.match(/mpc\.bus\s*=\s*\[([\s\S]*?)\];/);
  const genMatch = inputText.match(/mpc\.gen\s*=\s*\[([\s\S]*?)\];/);
  const branchMatch = inputText.match(/mpc\.branch\s*=\s*\[([\s\S]*?)\];/);
  
  const busCount = busMatch ? busMatch[1].trim().split('\n').filter(line => {
    const clean = line.replace(/%.*$/, '').trim();
    return clean.length > 0 && !clean.startsWith('%');
  }).length : 0;
  
  const genCount = genMatch ? genMatch[1].trim().split('\n').filter(line => {
    const clean = line.replace(/%.*$/, '').trim();
    return clean.length > 0 && !clean.startsWith('%');
  }).length : 0;
  
  const branchCount = branchMatch ? branchMatch[1].trim().split('\n').filter(line => {
    const clean = line.replace(/%.*$/, '').trim();
    return clean.length > 0 && !clean.startsWith('%');
  }).length : 0;

  // Cabeçalho
  formattedOutput += "=================================================================================================\n";
  formattedOutput += "|                              SISEP - Entrada do Sistema Elétrico                              |\n";
  formattedOutput += "=================================================================================================\n\n";

  // Resumo do sistema
  formattedOutput += "  Resumo da entrada\n";
  formattedOutput += "-------------------------------------------------------------------------------------------------\n";
  
  const funcLabel = "Nome da função:";
  const funcValue = `Função ${functionName}`;
  const busLabel = "Quantidade de barras:";
  const busValue = busCount.toString();
  
  const verLabel = "Versão:";
  const verValue = version;
  const genLabel = "Quantidade de geradores:";
  const genValue = genCount.toString();
  
  const baseLabel = "Base de Potência:";
  const baseValue = `${baseMVA} MVA`;
  const branchLabel = "Quantidade de linhas:";
  const branchValue = branchCount.toString();
  
  formattedOutput += `  ${funcLabel.padEnd(20)} ${funcValue.padEnd(30)} ${busLabel.padEnd(28)} ${busValue.padStart(2)}\n`;
  formattedOutput += `  ${verLabel.padEnd(20)} ${verValue.padEnd(30)} ${genLabel.padEnd(28)} ${genValue.padStart(2)}\n`;
  formattedOutput += `  ${baseLabel.padEnd(20)} ${baseValue.padEnd(30)} ${branchLabel.padEnd(28)} ${branchValue.padStart(2)}\n`;
  formattedOutput += "\n";

  // Extrair e formatar mpc.bus
  if (busMatch) {
    const busData = busMatch[1].trim();
    const busLines = busData.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    formattedOutput += "=================================================================================================\n";
    formattedOutput += "|                                  Dados das Barras (mpc.bus)                                   |\n";
    formattedOutput += "=================================================================================================\n";
    formattedOutput += "  Barra  Tipo     Pd       Qd      Gs     Bs    Area    Vm     Va    BaseKV  Zone   Vmax   Vmin \n";
    formattedOutput += "    #            (MW)    (MVAr)   (MW)  (MVAr)         (pu)   (deg)   (kV)          (pu)   (pu) \n";
    formattedOutput += "   ---    ---  -------- -------- ------ ------   ---  ------ ------  ------   ---  ------ ------\n";
    
    busLines.forEach((line) => {
      // Remover comentários e limpar a linha
      const cleanLine = line.replace(/%.*$/, '').replace(/;$/, '').trim();
      if (cleanLine.length === 0) return;
      
      // Separar valores por espaços ou tabs
      const values = cleanLine.split(/\s+/);
      
      if (values.length >= 13) {
        const bus = values[0].padStart(3);
        const type = values[1].padStart(3);
        const pd = parseFloat(values[2]).toFixed(2).padStart(8);
        const qd = parseFloat(values[3]).toFixed(2).padStart(8);
        const gs = parseFloat(values[4]).toFixed(2).padStart(6);
        const bs = parseFloat(values[5]).toFixed(2).padStart(6);
        const area = values[6].padStart(3);
        const vm = parseFloat(values[7]).toFixed(3).padStart(6);
        const va = parseFloat(values[8]).toFixed(2).padStart(6);
        const baseKv = parseFloat(values[9]).toFixed(1).padStart(6);
        const zone = values[10].padStart(3);
        const vmax = parseFloat(values[11]).toFixed(3).padStart(6);
        const vmin = parseFloat(values[12]).toFixed(3).padStart(6);
        
        formattedOutput += `   ${bus}    ${type}  ${pd} ${qd} ${gs} ${bs}   ${area}  ${vm} ${va}  ${baseKv}   ${zone}  ${vmax} ${vmin}\n`;
      }
    });
    formattedOutput += "\n";
  }

  // Extrair e formatar mpc.gen
  if (genMatch) {
    const genData = genMatch[1].trim();
    const genLines = genData.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    formattedOutput += "=================================================================================================\n";
    formattedOutput += "|                                 Dados dos Geradores (mpc.gen)                                 |\n";
    formattedOutput += "=================================================================================================\n";
    formattedOutput += "   Barra    Pg        Qg       Qmax      Qmin       Vg      mBase   Status    Pmax      Pmin     \n";
    formattedOutput += "     #     (MW)     (MVAr)    (MVAr)    (MVAr)     (pu)     (MVA)             (MW)      (MW)     \n";
    formattedOutput += "    ---  --------  --------  --------  --------  --------  --------   ---   --------  --------   \n";
    
    genLines.forEach((line) => {
      const cleanLine = line.replace(/%.*$/, '').replace(/;$/, '').trim();
      if (cleanLine.length === 0) return;
      
      const values = cleanLine.split(/\s+/);
      
      if (values.length >= 10) {
        const bus = values[0].padStart(3);
        const pg = parseFloat(values[1]).toFixed(2).padStart(8);
        const qg = parseFloat(values[2]).toFixed(2).padStart(8);
        const qmax = parseFloat(values[3]).toFixed(2).padStart(8);
        const qmin = parseFloat(values[4]).toFixed(2).padStart(8);
        const vg = parseFloat(values[5]).toFixed(3).padStart(8);
        const mBase = parseFloat(values[6]).toFixed(1).padStart(8);
        const status = values[7].padStart(3);
        const pmax = parseFloat(values[8]).toFixed(2).padStart(8);
        const pmin = parseFloat(values[9]).toFixed(2).padStart(8);
        
        formattedOutput += `    ${bus}  ${pg}  ${qg}  ${qmax}  ${qmin}  ${vg}  ${mBase}   ${status}   ${pmax}  ${pmin}\n`;
      }
    });
    formattedOutput += "\n";
  }

  // Extrair e formatar mpc.branch
  if (branchMatch) {
    const branchData = branchMatch[1].trim();
    const branchLines = branchData.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    formattedOutput += "=================================================================================================\n";
    formattedOutput += "|                                  Dados das Linhas (mpc.branch)                                |\n";
    formattedOutput += "=================================================================================================\n";
    formattedOutput += "  Barras        R        X        B      RateA  RateB  RateC  Ratio  Ângulo Status   Ângulos     \n";
    formattedOutput += " De   Para   Resist.   Reat.   Suscep.   (MVA)  (MVA)  (MVA)         (deg)          Mín.   Máx.  \n";
    formattedOutput += " ---   ---  -------- -------- --------  ------ ------ ------  -----  ------    --- ------ ------ \n";
    
    branchLines.forEach((line) => {
      const cleanLine = line.replace(/%.*$/, '').replace(/;$/, '').trim();
      if (cleanLine.length === 0) return;
      
      const values = cleanLine.split(/\s+/);
      
      if (values.length >= 11) {
        const fbus = values[0].padStart(3);
        const tbus = values[1].padStart(3);
        const r = parseFloat(values[2]).toFixed(5).padStart(8);
        const x = parseFloat(values[3]).toFixed(5).padStart(8);
        const b = parseFloat(values[4]).toFixed(5).padStart(8);
        const rateA = parseFloat(values[5]).toFixed(1).padStart(6);
        const rateB = parseFloat(values[6]).toFixed(1).padStart(6);
        const rateC = parseFloat(values[7]).toFixed(1).padStart(6);
        const ratio = parseFloat(values[8]).toFixed(3).padStart(5);
        const angle = parseFloat(values[9]).toFixed(2).padStart(6);
        const status = values[10].padStart(3);
        const angmin = values.length >= 12 ? parseFloat(values[11]).toFixed(0).padStart(6) : "     -";
        const angmax = values.length >= 13 ? parseFloat(values[12]).toFixed(0).padStart(6) : "     -";
        
        formattedOutput += ` ${fbus}   ${tbus}  ${r} ${x} ${b}  ${rateA} ${rateB} ${rateC}  ${ratio} ${angle}     ${status} ${angmin} ${angmax}\n`;
      }
    });
    formattedOutput += "\n";
  }

  return formattedOutput;
}
