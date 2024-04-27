import React from 'react';
import ReactDOM from 'react-dom';
import SearchForm from './SearchForm';
import ResultsRender from './ResultsRender';
import SentResultsRender from './SentResultsRender';

ReactDOM.render(
    <div>
        <SearchForm />
        <SentResultsRender />
        <ResultsRender />
    </div>,
    document.getElementById('app_root')
)
