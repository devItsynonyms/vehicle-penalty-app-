import React, { useEffect,useState } from 'react'
import Table from '../../shared_components/table';
// import { PenaltyTableHeader, PenaltyData } from '../../data/PenaltyData'
import MainActionContainer from '../../shared_components/MainActionContainer';
import BreadCrumb from '../../shared_components/BreadCrump';
import Paginator from '../../shared_components/Paginator';
import Modal from '../../shared_components/modal';
import { penaltyTextFields, formTypes, pageType }  from '../../../utils/constants'
import { getPlaceHolderName, getTurkishDate } from '../../../utils/functions'
import pdf_logo from '../../../images/pdf_logo.jpg'
import { Avatar, Checkbox,  FormControlLabel, IconButton } from "@material-ui/core";
import { Delete, Edit } from '@material-ui/icons';
import { useDispatch,useSelector } from 'react-redux';
import { deletePenalty, getAllPenalties, searchPenaltiesData } from '../../../store/reducers/penalty/penalty.actions';
import ProgressBarSpinner from '../../shared_components/ProgressBarSpinner'
import Alert from '@material-ui/lab/Alert';
import EditDataModal from '../../shared_components/EditDataModal';
import ImageModal from '../../shared_components/ImageModal'

export default function Penalty(props) {

    
    const [pdfOpen, setPdfOpen] = useState({
        open: false,
        pdf: null,
    });
    const [selectedData, setSelectedData] = useState('')
    const dispatch = useDispatch()
    const penaltyReducer = useSelector((state) => state.penaltyReducer)
    const penaltyData = useSelector((state) => state.penaltyReducer.data)
    const authReducer = useSelector((state) => state.authReducer)
    const [sortingValues, setSortingValues] = useState({
        sortBy: 'created_at',
        limitEntries:25,
        page: 1
    })
    const [editModalOpen, setEditModalOpen] = useState({
        open: false,
        data: {},
    })



    function handleModalOpen(pdf){
        setPdfOpen({
            pdf: pdf,
            open : true,
        });
    };
    const handleModalClose = () => {
      setPdfOpen({
          ...pdfOpen,
          open: false
      });
    };
    
    


    const handleEditDataModalOpen = (data) => {
        setEditModalOpen({
            data: data,
            open:true,
        });
    };

    const handleEditDataModalClose = () => {
        setEditModalOpen({
            ...editModalOpen,
            open:false,
        });
    };

    useEffect(() => {
        
        dispatch(getAllPenalties(sortingValues.sortBy, sortingValues.page, sortingValues.limitEntries))

    }, [sortingValues])
    
    useEffect(() => {
        
        handleEditDataModalClose()

    }, [penaltyReducer.data])

    const handlePagination = (page) => {
        setSortingValues({
            ...sortingValues,
            page: page
        })
    }

    
    const handleLimitEntriesChange = (event) => {
        setSortingValues(
            {
                ...sortingValues,
                limitEntries: event.target.value,
            }
        );
    };

    const handleSortByChange = (event) => {
        setSortingValues(
            {
                ...sortingValues,
                sortBy: event.target.value,
            }
        );
    };
    const handleDelete = (penalty_id)=> {
        if('id' in authReducer.data) {

            dispatch(deletePenalty(authReducer.data.id, penalty_id))
        }

    }

    const links = [
        {
            url:"/ana-sayfa", 
            name: "Anasayfa"
        },
        {
            url:"/ceza", 
            name: "Ceza ekle"
        }
        
    ]

    const handleRefreshPage = ()=> {

        dispatch(getAllPenalties())
    }
    const handleSearching = (data)=> {

        if(data.query !== '') {
            const formData = new FormData()
            formData.append('value', data.query.toLowerCase())

            dispatch(searchPenaltiesData(formData))
        }else {
            handleRefreshPage()
        }
    }

    const toggleCheckingAllCheckboxes = ()=> {
        const selected_data = selectedData === ''?[]:selectedData.split(',')
        if(selected_data.length  === penaltyData.data.length) {
            console.log("1111")
            setSelectedData([''].join())
        }else {
            console.log("sdfdsfds")
            const selected = penaltyData.data.map((item)=>item.id)
            console.log(selected.join())
            setSelectedData(selected.join())
        }

    }
    const handleCheckBoxChange = (e)=> {
        const value = e.target.value
        let selected = selectedData.split(',')
        selected = (selected['0'] === "")?[]:selected

        if(checkIfDataExists(e.target.value)) {
            const index = selected.indexOf(value);
            if (index > -1) {
                selected.splice(index, 1);
            }
        }else {
            selected.push(value)
        }
        setSelectedData(selected.join())
    }
    
    function checkIfDataExists(data) {
        return selectedData.split(',').includes(data.toString())
    }
    function formatData(data, isTurkish = true){
        const allData = []
        let formattedData = {}
        for(const key in data) { 

            formattedData['seç'] = <FormControlLabel control={
                <Checkbox name={data[key].id} value={data[key].id} checked={checkIfDataExists(data[key].id)} 
                    onChange={handleCheckBoxChange}/>
            } />
            for (const header in data[key]) {

                
                if(header !== 'id' && header !== 'added_by') {

                    if(header.trim() === 'pdf_url') {
                    
                        const placeholder = isTurkish?'pdf'.toUpperCase():'pdf'
                        if(data[key][header] === ''){
                            formattedData[placeholder] = ''
                        }else {
                            formattedData[placeholder] = <IconButton onClick={()=>handleModalOpen(data[key][header])}> 
                                    <Avatar alt="pdf logo" variant="square" src={pdf_logo} />
                                </IconButton>

                        }
                    }else if(header.trim() === 'image_url') {
                    
                        const placeholder = isTurkish?'resmi'.toUpperCase():'image'
                        if(data[key][header] === ''){
                            formattedData[placeholder] = ''
                        }else {
                            formattedData[placeholder] = <ImageModal image={data[key][header]} />

                        }
                    }else if(header.trim() === 'created_at' || header.trim() === 'updated_at'){
                        
                        const placeholder = isTurkish?getPlaceHolderName(header, penaltyTextFields):header
                        formattedData[placeholder] = getTurkishDate(data[key][header])
                    }else {

                        
                        const placeholder = isTurkish?getPlaceHolderName(header, penaltyTextFields):header
                        formattedData[placeholder] = data[key][header]
                    }
                }
                
                
            }

            
            const placeholder1 = isTurkish?'Tarafından eklendi'.toUpperCase():"added_by"
            formattedData[placeholder1] = data[key]['added_by']['name'] + " " + data[key]['added_by']['surname']


            const placeholder = isTurkish?'AKSİYON'.toUpperCase():"action"
            formattedData[placeholder] = <>
                    <IconButton color="primary" onClick={()=>handleEditDataModalOpen(data[key])}> <Edit /> </IconButton>
                    <IconButton style={{color: '#ff0000'}} onClick={()=>handleDelete(data[key].id)}> <Delete /> </IconButton>
                </>
            allData.push(formattedData)
            formattedData = {}

        }

        return allData
    }

    function getTableHeaders(data){
        const tableHeaders = []
        for(const key in data) {
            
            for (const header in data[key]) {
                tableHeaders.push(header)
            }
            break

        }

        
        tableHeaders.splice(1, 0, "#")

        return tableHeaders
    }

    const formatMoreData = () => {

        const headers = getTableHeaders(formatData( penaltyData.data, false))
        // removing unwanted cols
        if(headers.includes('#')) {
            const index = headers.indexOf('#');
            if (index > -1) {
                headers.splice(index, 1);
            }
        }
        if(headers.includes('pdf')) {
            const index = headers.indexOf('pdf');
            if (index > -1) {
                headers.splice(index, 1);
            }
        }
        if(headers.includes('penalty_date')) {
            const index = headers.indexOf('penalty_date');
            if (index > -1) {
                headers.splice(index, 1);
            }
        }
        if(headers.includes('payment_date')) {
            const index = headers.indexOf('payment_date');
            if (index > -1) {
                headers.splice(index, 1);
            }
        }
        if(headers.includes('action')) {
            const index = headers.indexOf('action');
            if (index > -1) {
                headers.splice(index, 1);
            }
        }
        if(headers.includes('select')) {
            const index = headers.indexOf('select');
            if (index > -1) {
                headers.splice(index, 1);
            }
        }
        if(headers.includes('seç')) {
            const index = headers.indexOf('seç');
            if (index > -1) {
                headers.splice(index, 1);
            }
        }
        

        return headers;
    }
    const formatMainActionData = (data) => {
        
        data.sortByOptions = formatMoreData();

        return data;
    }

    const formatExcelData = (data) => {
        
        const selected = selectedData.split(',')
        if(!Array.isArray(data)) {
            return []
        }
        return data.filter((item)=> (selected.includes(item.id.toString())))
    }


    return (

        <div>
            <BreadCrumb links={links} />
            <MainActionContainer 
                data={formatMainActionData(pageType.penalty)}
                dataSet={formatData(formatExcelData( penaltyData.data))} 
                dataSetHeaders={getTableHeaders(formatData( penaltyData.data))}
                sortingValues={sortingValues}
                handleSearching = {handleSearching}
                handleRefreshPage={handleRefreshPage}
                handleLimitEntriesChange={handleLimitEntriesChange}
                handleSortByChange={handleSortByChange}
                toggleCheckingAllCheckboxes={toggleCheckingAllCheckboxes}
            />

            {
                penaltyReducer.loading?
                    <ProgressBarSpinner />
                :
                    ("data" in penaltyData)?
                    <>
                        <Table rows= {formatData( penaltyData.data)} 
                            tableHeader ={ getTableHeaders(formatData( penaltyData.data)) }/>
                        <Paginator paginationCount={penaltyData.last_page} 
                            handlePagination={handlePagination} 
                            page={ penaltyData.current_page }
                        />
                        <EditDataModal 
                            editModalOpen={editModalOpen}
                            handleEditDataModalClose={handleEditDataModalClose}
                            formType={formTypes.newPenalty}
                        />

                    </>
                    :
                    <Alert severity="info">0 results found</Alert>
            }

            <Modal handleClose={handleModalClose} open={pdfOpen.open} pdf={pdfOpen.pdf} />
        </div>

    );



}
