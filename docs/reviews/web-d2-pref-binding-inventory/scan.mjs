import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),ts=require('typescript');
const root=fileURLToPath(new URL('../../../',import.meta.url));
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024});
const revision=git('rev-parse',process.argv[2]+'^{commit}').trim();
const output=new URL('./bindings-'+revision.slice(0,7)+'.json',import.meta.url);
if(existsSync(output))throw Error('Fixed evidence exists');
const files=git('ls-tree','-r','--name-only',revision,'packages').trim().split('\n').filter(p=>p.endsWith('.tsx')&&!p.includes('/__tests__/'));
const rows=[];
for(const file of files){
 const source=ts.createSourceFile(file,git('show',revision+':'+file),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const walk=node=>{if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='usePref'){
  let owner=node.parent;while(ts.isAsExpression(owner)||ts.isParenthesizedExpression(owner)||ts.isTypeAssertionExpression(owner))owner=owner.parent;
  const binding=ts.isVariableDeclaration(owner)&&ts.isArrayBindingPattern(owner.name)?owner.name:null;
  const element=binding?.elements[1],setter=element&&ts.isBindingElement(element)&&ts.isIdentifier(element.name)?element.name.text:null;
  let argument=node.arguments[0];while(argument&&(ts.isAsExpression(argument)||ts.isParenthesizedExpression(argument)||ts.isTypeAssertionExpression(argument)))argument=argument.expression;const literal=argument&&(ts.isStringLiteral(argument)||ts.isNoSubstitutionTemplateLiteral(argument))?argument.text:null;
  let calls=0,references=0;
  if(setter){const visit=n=>{if(ts.isIdentifier(n)&&n.text===setter&&n!==element.name){references++;if(ts.isCallExpression(n.parent)&&n.parent.expression===n)calls++;}ts.forEachChild(n,visit);};visit(source);}
  rows.push({file,line:source.getLineAndCharacterOfPosition(node.getStart()).line+1,key:literal??argument?.getText(source),literal:literal!==null,setter,directCalls:calls,syntacticReferences:references});
 }ts.forEachChild(node,walk);};walk(source);
}
const result={revision,boundary:'Tracked packages/**/*.tsx except __tests__, direct identifier usePref calls; syntactic references only, no symbol flow or full writer inventory',counts:{files:new Set(rows.map(x=>x.file)).size,bindings:rows.length,literalKeys:new Set(rows.filter(x=>x.literal).map(x=>x.key)).size,dynamicSites:rows.filter(x=>!x.literal).length,setterBindings:rows.filter(x=>x.setter).length,directlyInvokedSetters:rows.filter(x=>x.directCalls).length,downstreamOnly:rows.filter(x=>x.setter&&!x.directCalls&&x.syntacticReferences).length,readOnlyBindings:rows.filter(x=>!x.setter).length},rows};
writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result.counts));
