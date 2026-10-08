import {useEffect,useState} from 'react';
import {useParams} from 'react-router-dom';
import Navbar from '../components/Navbar';
import EmptyState from '../components/EmptyState';
import ListingDetails from '../components/ListingDetails';
import {api} from '../services/api';
export default function PropertyDetails(){const {id}=useParams();const [property,setProperty]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');useEffect(()=>{let live=true;setLoading(true);setError('');api.getProperty(id).then(p=>{if(live)setProperty(p?.status==='Approved'?p:null);}).catch(()=>{if(live)setError('This property couldn’t be loaded. Please try again.');}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[id]);if(loading||!property)return <><Navbar/><main id="main-content" className="page-width py-16">{loading?<div className="skeleton" aria-label="Loading property"/>:<EmptyState title={error||'This home is no longer available'} subtitle="Explore the collection to find another place you’ll love." actionTo="/properties" actionLabel="Explore properties"/>}</main></>;return <ListingDetails key={id} property={property}/>;}
