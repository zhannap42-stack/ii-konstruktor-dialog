import {FilePicker} from '@reactor/browser';
import {Alignments} from '@reactor/core';
import {intl} from '@reactor/intl';
import React,{useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {UploaderPreview,UploaderUploadButton,FileIcon,ActionMenu,Badge,CoreButton,translations,ReactorTheme,Box,Row,Column,Text,Button,Icon,IconButton,Field,Tile,Alert,Radio,ColorPicker,ColorSwatch,Uploader,UploaderMode,Loader} from '@reactor/reactor';

import aiPicture from './ai-laptop.svg';
import footerLogo from './footer-logo.svg';
import editorImage from './editor.png';
const T=({children,kind='paragraph',color='foreground',...rest}:any)=><Text text={React.Children.toArray(children).join('')} typography={kind} color={color} {...rest}/>;
const B=({children,primary=false,...p}:any)=><Button text={children} type={primary?'primary':'default'} {...p}/>;
const menu=[['lamp','Помощник'],['calendar-day','Управление номерами'],['house','Настройки гостиницы'],['developer-board','Управление отелем'],['laptop','AI-сайты'],['hive','Менеджер каналов'],['forum','Репутация'],['laptop','Конструктор сайта'],['folder','Документооборот'],['user-check','Онлайн-регистрация'],['chart','Отчеты'],['arrow-circle-double','Сравнение цен']];
// Figma content values for the site's palette. UI colors themselves use Reactor tokens.
const palette=[['Золотой',12027955],['Песчаный',14463594],['Терракотовый',13919297],['Коралловый',15295592],['Бордовый',9052227],['Фиолетовый',7428567],['Синий',1799594],['Голубой',3057355],['Бирюзовый',37259],['Зеленый',4096350],['Оливковый',8028987],['Коричневый',8148292]] as const;
type FileItem={name:string,url:string};
const buckets:Record<string,FileItem[]>={photos:[],docs:[],brand:[]};
function makeTransport(key:string,changed:()=>void){return {list:async()=>buckets[key],upload:async(file:File)=>{let x={name:file.name,url:URL.createObjectURL(file)};buckets[key]=[...buckets[key],x];changed();return x},delete:async(items:FileItem[])=>{items.forEach(x=>URL.revokeObjectURL(x.url));buckets[key]=buckets[key].filter(x=>!items.includes(x));changed()},replace:async(pairs:any[])=>{return pairs.map(p=>{URL.revokeObjectURL(p.old.url);let x={name:p.new.name,url:URL.createObjectURL(p.new)};buckets[key]=buckets[key].map(a=>a===p.old?x:a);changed();return x})}}}
function PhotoUpload({bucket,type='file',changed}:any){const mode=useMemo(()=>UploaderMode.auto(makeTransport(bucket,changed)),[bucket]);return <Uploader mode={mode} type={type} multiple={bucket!=='brand'} accept={type==='photo'?['.jpg','.jpeg','.png','.webp']:bucket==='brand'?['.pdf']:['.pdf','.docx','.txt']} maxSize={30} maxFiles={bucket==='brand'?1:30}/>}
function Upload({bucket,type='file',changed}:any){
 const [error,setError]=useState('');
 if(type==='photo')return <PhotoUpload bucket={bucket} type={type} changed={changed}/>;
 const accept=bucket==='brand'?['.pdf']:['.pdf','.docx','.txt'];
 const pick=async(replace?:FileItem)=>{const files=await FilePicker.select({accept,multiple:bucket!=='brand'&&!replace});if(!files.length)return;
 const valid=files.filter(f=>accept.some(ext=>f.name.toLowerCase().endsWith(ext))&&f.size<=30*1024*1024);
 setError(valid.length<files.length?'Поддерживаются '+accept.join(', ')+' до 30 МБ.':'');
 if(!valid.length)return;const added=valid.map(f=>({name:f.name,url:URL.createObjectURL(f)}));
 if(replace){URL.revokeObjectURL(replace.url);buckets[bucket]=buckets[bucket].map(f=>f===replace?added[0]:f)}else buckets[bucket]=bucket==='brand'?added.slice(0,1):[...buckets[bucket],...added];changed();};
 return <Column gap={16}>{error&&<Alert status="warning" text={error}/>}<Row gap={16} wrap>{(bucket!=='brand'||!buckets[bucket].length)&&<UploaderUploadButton type="file" onClick={()=>pick()}/>} {buckets[bucket].map(file=><UploaderPreview key={file.url} content={<Column decoration="document-preview" gap={8} alignItems="center" justifyContent="center"><FileIcon icon="file" color={file.name.toLowerCase().endsWith('.pdf')?'pink':'accent'} text={file.name.split('.').pop()}/><Text text={file.name} typography="caption"/></Column>} onReplace={()=>pick(file)} onDelete={()=>{URL.revokeObjectURL(file.url);buckets[bucket]=buckets[bucket].filter(f=>f!==file);changed()}}/>)}</Row></Column>
}
function FormRow({title,help,children}:any){return <Row decoration="form-row" gap={30} alignItems="flex-start"><Box decoration="form-label" gap={8}><T>{title}</T><T kind="caption" color="neutral">{help}</T></Box><Box decoration="form-control" gap={16}>{children}</Box></Row>}
function Panel({title,children}:any){return <Tile decoration={"panel "+(title==='Мои Сайты'?'home-panel':title==='AI-кредиты'?'credits-panel':'')}><Column gap={0}><Box decoration="panel-heading"><T kind="block-title">{title}</T></Box><Column decoration="panel-body" gap={32}>{children}</Column></Column></Tile>}
// UI Kit: Card design (181:6426 / 474:9993), composed from Reactor primitives.
function CardDesign({title,description,selected,active=selected,onSelect,children}:any){return <Tile decoration={'card-design'+(active?' selected':'')}><Column gap={16}><Row decoration="card-design-header" gap={4} alignItems="flex-start"><Box decoration="card-design-radio" alignItems="center" justifyContent="center"><Radio value={selected} onChange={onSelect}/></Box><CoreButton decoration={['card-design-title']} onClick={onSelect}><Column gap={8}><T kind="subtitle">{title}</T><T kind="promo-paragraph">{description}</T></Column></CoreButton></Row>{React.Children.toArray(children).length>0&&<Box decoration="card-design-setting">{children}</Box>}</Column></Tile>}
// UI Kit: Down button — normal, hover, selected and selected-hover states.
function DownButton({value,children,selected=false,onClick,buttonRef}:any){return <CoreButton ref={buttonRef} decoration={['down-button',selected?'selected':'']} onClick={onClick} aria-pressed={selected}><ColorSwatch value={value}/>{children}</CoreButton>}
const CustomColorSelection=React.createContext(false);
function CustomColorField({value,onClick,ref}:any){const selected=React.useContext(CustomColorSelection);return <DownButton value={value} selected={selected} onClick={onClick} buttonRef={ref}><Icon name="color-fill" color="neutral"/></DownButton>}
const exampleSites=[
{id:1,name:'Сонная Лощина',version:4,date:'16.10.2026, 13:20',languages:'RU, EN-US, AR, HY',domain:true,status:'Опубликован'},
{id:2,name:'Сонная Лощина 1',version:2,date:'16.10.2026, 13:20',languages:'RU, EN-US, AR, HY',domain:false,status:'Опубликован'},
{id:3,name:'Сонная Лощина 2',version:1,date:'17.10.2026, 11:00',languages:'RU',domain:false,status:'Черновик'},
{id:4,name:'Сонная Лощина 3',version:5,date:'17.10.2026, 11:00',languages:'RU',domain:true,status:'Готов к публикации'}];
function SiteActions({site,onAction}:any){return <ActionMenu window={{size:()=>({minWidth:240,maxWidth:240})}} actions={[
{icon:'edit',text:'Редактировать',onClick:()=>onAction('Редактировать',site)},
{icon:'redo',text:'Подготовить публикацию',onClick:()=>onAction('Подготовить публикацию',site)},
{icon:'settings',text:'Настройка сайта',onClick:()=>onAction('Настройка сайта',site)},
{icon:'return-time',text:'История версий',onClick:()=>onAction('История версий',site)},
{icon:'delete',text:'Удалить',onClick:()=>onAction('Удалить',site)}]}/>}

export {T,B,menu,palette,buckets,Upload,Panel,DownButton,CustomColorSelection,CustomColorField,SiteActions,aiPicture,footerLogo,editorImage};
