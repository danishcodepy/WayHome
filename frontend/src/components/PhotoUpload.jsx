import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, Trash2 } from 'lucide-react';

async function preparePhoto(file) {
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024) throw new Error('Use JPG, PNG or WebP photos smaller than 8 MB.');
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file), photo=new Image();
    photo.onload=()=>{
      try {
        const scale=Math.min(1,1100/photo.width,900/photo.height), canvas=document.createElement('canvas');
        canvas.width=Math.round(photo.width*scale);canvas.height=Math.round(photo.height*scale);
        canvas.getContext('2d').drawImage(photo,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL('image/webp',.78));
      } catch { reject(new Error('Could not prepare a photo. Please try a different image.')); }
      finally { URL.revokeObjectURL(url); }
    };
    photo.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('One photo could not be opened. Try another image.'));};
    photo.src=url;
  });
}
export default function PhotoUpload({ images, onChange, busy, setBusy, onError }) {
  const [dragging,setDragging]=useState(false), dragged=useRef(null);
  const add=async files=>{
    if(busy||!files.length)return;
    if(images.length+files.length>6){onError('You can add up to 6 photos.');return;}
    setBusy(true);onError('');
    try { const prepared=await Promise.all([...files].map(preparePhoto));onChange([...images,...prepared]); }
    catch(error){onError(error.message);} finally {setBusy(false);}
  };
  const move=(from,to)=>{
    if(from==null||to<0||to>=images.length||from===to)return;
    const next=[...images], [image]=next.splice(from,1);next.splice(to,0,image);onChange(next);dragged.current=null;
  };
  return <><label className={`upload-dropzone ${dragging?'is-dragging':''}`} onDragOver={event=>{event.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={event=>{event.preventDefault();setDragging(false);add(event.dataTransfer.files);}}>{busy?<LoaderCircle size={30} className="button-spinner"/>:<ImagePlus size={30}/>}<strong>{busy?'Preparing your photos…':'Drag photos here or browse'}</strong><small>JPG · PNG · WebP · Up to 6 photos · 8 MB each</small><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} aria-label="Browse property photos" onChange={event=>{add(event.target.files);event.target.value='';}}/></label>{images.length>0&&<><p className="ui-field-hint">Drag to reorder, or use the arrow buttons. The first photo is your cover.</p><div className="photo-sort-grid">{images.map((image,index)=><div className="photo-sort-item" key={image+index} draggable={!busy} onDragStart={()=>{dragged.current=index;}} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();move(dragged.current,index);}} onDragEnd={()=>{dragged.current=null;}}><img draggable="false" src={image} alt={`Property photo ${index+1}`}/>{index===0&&<span className="cover-label">Cover image</span>}<div className="photo-sort-actions"><button type="button" disabled={index===0||busy} aria-label={`Move photo ${index+1} earlier`} onClick={()=>move(index,index-1)}><ArrowLeft size={16}/></button><button type="button" disabled={busy} aria-label={`Remove photo ${index+1}`} onClick={()=>onChange(images.filter((_,i)=>i!==index))}><Trash2 size={16}/></button><button type="button" disabled={index===images.length-1||busy} aria-label={`Move photo ${index+1} later`} onClick={()=>move(index,index+1)}><ArrowRight size={16}/></button></div></div>)}</div></>}</>;
}
