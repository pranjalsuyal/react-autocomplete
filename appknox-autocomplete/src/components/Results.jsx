import React from 'react';

const Results = ({results, noresult}) => {
    return (
        <div className='resultsContainer'>
            { (results.length === 0 && noresult) ?
                <div className='resultsBlock'>
                    <h3>Sorry No Results Found!</h3>
                    <p>Please try again with different querry</p>
                </div>
            : 
            results.map((result) => {
                const url = `https://en.wikipedia.org/?curid=${result.pageid}`;
                const description = result.description;
                return (
                    <div className='resultsBlock' key={result.pageid}>
                        <div>
                            <h3 className='articleHeader'>{result.title}</h3>
                            <p className='articleDescription'>{description}</p>
                        </div>
                        <a className='articleButton' href={url} target="_blank" rel="noreferrer">Go to Article</a>
                    </div>
                )
            })}
        </div>
    );
};

export default Results;
