import React from 'react';
import ReactDOM from 'react-dom';
import SearchForm from './SearchForm';
import ResultsRender from './ResultsRender';
import SentResultsRender from './SentResultsRender';
import SentProgress from './SentProgress';

ReactDOM.render(
    <div>
        <SearchForm />
        <SentProgress />
        <SentResultsRender />
        <ResultsRender />
    </div>,
    document.getElementById('app_root')
)
