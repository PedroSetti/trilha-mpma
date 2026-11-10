export const MAX_ATTACHMENT=3*1024*1024;
export function validateAttachment(bytes,name){
 if(!bytes.length||bytes.length>MAX_ATTACHMENT)throw Error('Envie um arquivo de até 3 MB.');
 let mime;if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)mime='image/jpeg';
 else if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))mime='image/png';
 else if(bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP')mime='image/webp';
 else if(bytes.subarray(0,5).toString()==='%PDF-')mime='application/pdf';
 else throw Error('Use imagem JPG, PNG, WebP ou arquivo PDF.');
 const ext={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','application/pdf':'.pdf'}[mime];
 let safe=String(name||'anexo').normalize('NFC').replace(/[\x00-\x1f\x7f/\\<>:"|?*]/g,'_').replace(/\.+/g,'.').slice(0,145).trim();
 safe=(safe.replace(/\.[^.]*$/,'')||'anexo')+ext;
 return {mime,name:safe,size:bytes.length};
}
