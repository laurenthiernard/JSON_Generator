import React, { useState, useEffect } from 'react'

export default function SimpleTabs(props) {

  const [activeTab, setActiveTab] = useState(0)

  const tabButton = props.tabs.map((tab, index) => {
    return <button className={`SimpleTabs-tab ${activeTab === index ? 'tab-active' : ''}`} key={index} onClick={() => setActiveTab(index)}>{props.tabs[index].title}</button>
  })

  useEffect(() => {
    props.dispatchIndex(activeTab)
  }, [activeTab])

  return (
    <div className="SimpleTabs-container">
      <div className="SimpleTabs-header">
      {tabButton}

      </div>
      {props.tabs[activeTab].tab}
    </div>
  )
}
