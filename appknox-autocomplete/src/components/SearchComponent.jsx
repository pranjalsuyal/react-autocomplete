import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { useOutsideClick } from '../hooks/HandleOutsideClickHook';

const SearchComponent = ({ handleResult, handleNoResult }) => {
    const [search, setSearch] = useState("");
    const [autoCompleteResult, setAutoCompleteResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [pastSearches, setPastSearches] = useState([]);

    useEffect(() => {
        const savedSearches = JSON.parse(localStorage.getItem("pastSearches"));
        if (savedSearches) {
          setPastSearches(savedSearches);
        }
    }, []);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => {
            clearTimeout(timerId);
        };
    }, [search]);

    const fetchAutoComplete = async () => {
        setLoading(true);
        if( !debouncedSearch || debouncedSearch.trim() === "") return;
        const URL = encodeURL(debouncedSearch);
        const autoCompleteResponse = await axios.get(URL).catch((err) => {
            console.log(err, 'err');
        });
        if(pastSearches[0] !== search) {
            setPastSearches([search, ...pastSearches.slice(0, 4)]);
            localStorage.setItem(
                "pastSearches",
                JSON.stringify([search, ...pastSearches.slice(0, 4)])
            );
        }
        setAutoCompleteResult(autoCompleteResponse.data.query.allpages);
        setLoading(false);
    };

    useEffect(() => {
        fetchAutoComplete();
    }, [debouncedSearch]);


    const handleInputChange = async(event) => {
        const query = event.target.value;
        setSearch(query);
        if (query.trim().length === 0) {
            setAutoCompleteResult([]);
            return;
        }
    }

    const handleFormSubmit = async (event, val) => {
        event && event.preventDefault();
        if( search.trim().length < 1 && !val) {
            return;
        }
        if(pastSearches[0] !== (search || val)) {
            setPastSearches([val || search, ...pastSearches.slice(0, 4)]);
            localStorage.setItem(
                "pastSearches",
                JSON.stringify([val || search, ...pastSearches.slice(0, 4)])
            );
        }
        const response = await axios.get(
            `https://en.wikipedia.org/w/api.php?format=json&action=query&generator=allpages&gapprefix=${val || search}&gaplimit=20&prop=description&origin=*`
        );
        if(response?.data?.query?.pages) {
            const data = response.data.query.pages;
            const arrayData = Object.values(data);
            handleResult(arrayData);
        } else {
            handleNoResult(true);
            handleResult([]);
        }
    }

    const encodeURL = (query) => {
        const url = `https://en.wikipedia.org/w/api.php?format=json&action=query&list=allpages&apprefix=${query}&aplimit=5&origin=*`;
        return encodeURI(url);
    }

    const handleAutoCompleteClick = (e, value) => {
        e.preventDefault();
        setSearch(value);
        handleFormSubmit(null, value);
        setIsExpanded(false);
    }

    const displayAutoCompleteSearchResults = () => {
        if (autoCompleteResult.length === 0 && search.trim() === "") {
            if(pastSearches.length === 0) {
                return <div className='initialSearchAuto'>Your Matching searches will be show here</div>
            }
            return(
                <ul>
                    {pastSearches.map((term, index) => (
                    <li
                        key={index}
                        className="autoCompleteCon"
                        onClick={(e) => handleAutoCompleteClick(e, term)}
                    >
                        {term}
                    </li>
                    ))}
                </ul>
            )
        }
        else if(autoCompleteResult.length === 0) {
            if(loading) return <div className="loader"></div>
            return <div>No results found.</div>
        } else if (loading) {
            return <div className="loader"></div>
        }
        return (
            autoCompleteResult.map((result) => {
                const title = result.title;
                const index = title.toLowerCase().indexOf(search.toLowerCase());
                const before = title.substring(0, index);
                const match = title.substring(index, index + search.length);
                const after = title.substring(index + search.length);

                return (
                    <li key={result.pageid} className="autoCompleteCon" onClick={(e) => handleAutoCompleteClick(e, title)}>
                        {before}
                        <strong>{match}</strong>
                        {after}
                    </li>
                );
            })
        );
    };

    const handleClickOutside = () => {
        setIsExpanded(false);
    }
    const ref = useOutsideClick(handleClickOutside);

    const handleCancelButton = (event) => {
        event.preventDefault();
        setIsExpanded(false);
        setSearch('');
        setAutoCompleteResult([]);
        setDebouncedSearch('');
        handleResult([]);
    }
    
    return (
        <header>
            <h1>AppKnox Wiki Search</h1>
            <form className='SearchContainer' onSubmit={(event) => handleFormSubmit(event)} ref={ref}>
                <input
                    type='search'
                    placeholder='Use me to search for anything'
                    value={search}
                    onChange={handleInputChange}
                    onFocus={e => setIsExpanded(true)}
                />
                {isExpanded &&
                    <React.Fragment>
                        <div className='divider' />
                        <div className="autoCompleteResults">{displayAutoCompleteSearchResults()}</div>
                    </React.Fragment>
                }
            </form>
            <button className='articleButton clearButton' onClick={handleCancelButton}>Clear Results</button>
        </header>
    );
};

export default SearchComponent;
