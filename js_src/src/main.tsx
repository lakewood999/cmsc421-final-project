import React from 'react';
import ReactDOM from 'react-dom';
import SearchForm from './SearchForm';
import ResultsRender from './ResultsRender';
import SentResultsRender from './SentResultsRender';
import SentProgress from './SentProgress';
import ModeSelector from './ModeSelector';

ReactDOM.render(
    <div>
        <SearchForm />
        <ModeSelector />
        <SentProgress />
        <SentResultsRender />
        <ResultsRender />
    </div>,
    document.getElementById('app_root')
)
