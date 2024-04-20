import React from 'react';
import ReactDOM from 'react-dom';
import SearchForm from './SearchForm';
import ResultsRender from './ResultsRender';
import SentProgress from './SentProgress';
import SentResultsRender from './SentResultsRender';

ReactDOM.render(
    <div>
        <SearchForm />
        <SentProgress />
        <SentResultsRender />
        <ResultsRender />
    </div>,
    document.getElementById('app_root')
)
