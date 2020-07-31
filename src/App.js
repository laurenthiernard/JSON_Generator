import React, { useState, useEffect } from 'react'
import './App.scss'

import Control from './components/Control'
import SimpleTabs from './components/SimpleTabs'
import { getUniqID } from './utils'
import initLayout from './layout.js'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStream, faCog, faLightbulb, faTrash, faCopy, faFolderPlus, faClone, faPaste, faExclamationTriangle, faFileCode, faUpload, faArrowRight, faExclamationCircle, faArrowLeft, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import ReactJson from 'react-json-view'

function App() {

  const saveSessionEnabled = true
  let initialJson = { Sections: [{ SectionId: "mjy5n", Title: "Section 1", Elements: [] }] }
  // Check if saved JSON is valid and assign it
  if (saveSessionEnabled) {
    const savedJson = JSON.parse(localStorage.getItem('currentJson'))
    if (savedJson !== null) initialJson = savedJson
  }

  const [json, setJson] = useState(initialJson)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [selectedControl, setSelectedControl] = useState({})
  const [isValidId, setIsValidId] = useState(true)
  const [mode, setMode] = useState('board')
  const [currentKeyword, setCurrentKeyword] = useState('')
  const [currentData, setCurrentData] = useState('')

  useEffect(() => {
    initLayout()
  }, [])

  useEffect(() => {
    localStorage.setItem('currentJson', JSON.stringify(json))
  }, [json])

  /**-------------------------------------------------**
  * @desc - DRAG AND DROP                         -----*
  *----------------------------------------------------*/

  let controlsHandler = e => {
    // console.log('---> ', e.target, e.target.id)
    e.dataTransfer.setData("text/plain", e.target.id)
  }
  let onDragOverHandler = e => {
    e.preventDefault()
  }
  let onDropHandler = e => {
    e.preventDefault()
    const elementName = e.dataTransfer.getData("text/plain")
    // console.log(`--->: App -> elementName`, elementName)

    let targetID = e.target.id
    let parentID = targetID.substring(0, 11)

    const notAllowedElement = [
      "Matrix",
      "Matrixbutton",
      "Repeatable",
      "Document.TableOfContents",
      "Document.Summary",
      "Document.Summary2",
      "Document.Summary3",
      "Document.Summary4",
      "Emailregister",
      "Smsregister",
      "QRScanner.List",
      "SignatureSignOnOff"
    ]

    let isValidElement = true
    if (notAllowedElement.findIndex(element => element === elementName) > -1) {
      isValidElement = false
    }


    // ---------------------------------------------------------------------------- MATRIX : ADD Elements
    if (targetID.includes('matrix')) {
      if (!isValidElement) {
        alert('Control not alowed inside a Matrix')
        return
      }
      let newElement = getNewElement(elementName)
      let droppedPosition = {
        row: targetID.substring(targetID.lastIndexOf('-row') + 4, targetID.lastIndexOf('-col')),
        col: targetID.substring(targetID.lastIndexOf('-col') + 4, targetID.length)
      }
      console.log(`---> Matrix element ${JSON.stringify(newElement)} dropped on parent: ${parentID} at position ${JSON.stringify(droppedPosition)}`)
      // console.log(`----> Look for parent ${parentID}: `,getElementFromElementId(parentID))
      // console.log(`----> Look for target ${targetID}: `,getElementFromElementId(targetID))

      const parentElement = getElementFromElementId(parentID)
      const elementRow = parentElement.Elements[droppedPosition.row]
      elementRow.Elements[droppedPosition.col] = newElement
      console.log('---> onDropHandler: parentElement is updated:  ', parentElement)

      const jsonToUpdate = JSON.parse(JSON.stringify(json))
      console.log(`--->: App -> jsonToUpdate`, jsonToUpdate)
      // jsonToUpdate.timestamp = new Date()
      setJson({ ...jsonToUpdate })

      // const nextState = produce(json, draftState => {
      //   draftState.user = {
      //     name: targetID
      //   }
      // })
      // console.log(`--->: App -> nextState`, nextState)
      // setJson({ ...nextState })
    }
    else if (targetID.includes('repeatable')) {
      if (!isValidElement) {
        alert('Control not alowed inside a Repeatable')
        return
      }
      let newElement = getNewElement(elementName)
      console.log(`---> Repeatable element ${JSON.stringify(newElement)} dropped on parent: ${parentID}`)
      const parentElement = getElementFromElementId(parentID)
      parentElement.Elements.push(newElement)

      const jsonToUpdate = JSON.parse(JSON.stringify(json))
      setJson({ ...jsonToUpdate })
    }
    // ---------------------------------------------------------------------------- TEMPLATES : ADD Elements
    else {
      switch (elementName) {
        case "Document.TableOfContents":
          prependToFirstSection(elementName,
            { Type: "Document.TableOfContents", Title: "Table Of Contents", ID: "DocTableOfContents", ElementId: getUniqID() },
          )
          break
        case "Document.Summary":
          addToNewSection(elementName, [
            { Type: "DocumentSummaryGrid", Title: "Show Summary", ID: "DocumentSummaryGrid", ElementId: getUniqID() },
            { Type: "Button.Submit.Register", ID: "Button.Submit.Register", Title: "Submit to Register", ElementId: getUniqID() },
            { Type: "Button.View.Document", ID: "Button.View.Document", Title: "View Document", ElementId: getUniqID() }])
          break
        case "Document.Summary2":
          addToNewSection(elementName, [
            { Type: "DocumentSummaryGrid", Title: "Show Summary", ID: "DocumentSummaryGrid", ElementId: getUniqID() },
            { Type: "Button.Submit.Register", Title: "Submit to Register", ID: "Button.Submit.Register", ElementId: getUniqID() },
            { Type: "Button.Closeout", Title: "Close out", ID: "Button.Closeout", ElementId: getUniqID() },
            { Type: "Button.View.Document", Title: "View Document", ID: "Button.View.Document", ElementId: getUniqID() },
          ])
          break
        case "Document.Summary3":
          addToNewSection(elementName, [
            { Type: "DocumentSummaryGrid", Title: "Show Summary", ID: "DocumentSummaryGrid", ElementId: getUniqID() },
            { Type: "Button.Submit.Register", Title: "Submit to Register", ID: "Button.Submit.Register", ElementId: getUniqID() },
            { Type: "Button.Send.SMS", Title: "Send SMS", ID: "Button.Send.SMS", ElementId: getUniqID() },
            { Type: "Button.Send.Email", Title: "Send Email", ID: "Button.Send.Email", ElementId: getUniqID() },
            { Type: "Button.View.Document", Title: "View Document", ID: "Button.View.Document", ElementId: getUniqID() }
          ])
          break
        case "Document.Summary4":
          addToNewSection(elementName, [
            { Type: "DocumentSummaryGrid", Title: "Show Summary", ID: "DocumentSummaryGrid", ElementId: getUniqID() },
            { Type: "Button.Submit.Register", Title: "Submit to Register", ID: "Button.Submit.Register", ElementId: getUniqID() },
            { Type: "Button.Closeout", Title: "Close out", ID: "Button.Closeout", ElementId: getUniqID() },
            { Type: "Button.Send.SMS", Title: "Send SMS", ID: "Button.Send.SMS", ElementId: getUniqID() },
            { Type: "Button.Send.Email", Title: "Send Email", ID: "Button.Send.Email", ElementId: getUniqID() },
            { Type: "Button.View.Document", Title: "View Document", ID: "Button.View.Document", ElementId: getUniqID() },
          ])
          break
        case "Emailregister":
          addToNewSection(elementName, [
            { Type: "SearchableListEntryDialogEmail", Title: "Select from Project Directory", ID: "ContactListEmail", ElementId: getUniqID() },
            { Type: "Label", Title: "OR", ElementId: getUniqID() },
            { Type: "Label", Title: "Add manually below", ElementId: getUniqID() },
            { Type: "Text", Title: "Name", ID: "ManualEmailName", ElementId: getUniqID() },
            { Type: "Text", Title: "Email", ID: "ManualEmailEmail", ElementId: getUniqID() },
            { Type: "Button.Add.Email", Title: "Add contact manually", ElementId: getUniqID() },
            { Type: "SearchableEmailListView", Title: "Name", ID: "NameEmailList", ElementId: getUniqID() }
          ])
          break
        case "Smsregister":
          addToNewSection(elementName, [
            { Type: "SearchableListEntryDialogSMS", Title: "Select from Project Directory", ID: "ContactListSMS", ElementId: getUniqID() },
            { Type: "Label", Title: "OR", ElementId: getUniqID() },
            { Type: "Label", Title: "Add manually below", ElementId: getUniqID() },
            { Type: "Text", Title: "Name", ID: "ManualSMSName", ElementId: getUniqID() },
            { Type: "Text", Title: "Phone No", ID: "ManualSMSPhone", ElementId: getUniqID() },
            { Type: "Button.Add.SMS", Title: "Add contact manually", ElementId: getUniqID() },
            { Type: "SearchableSMSListView", Title: "Name", ID: "NameSMSList", ElementId: getUniqID() }
          ])
          break
        case "QRScanner.List":
          addToNewSection(elementName, [
            // { Type: "QRScanner.List", Title: "QR scanner list", ID: "QReSignOnOffScanner", ElementId: getUniqID() }
            {Type:"QRScanner.List", Title:"QR scanner list", EntryTitle:"Please click to scan QR code", ID:"QReSignOnOffScanner", ElementId: getUniqID()}
          ])
          break
        case "SignatureSignOnOff":
          addToCurrentSection(elementName, [
            { Type: "Text", Title: "Name", ID: "SignatureSignOnOffName", ElementId: getUniqID() },
            { Type: "Signature", Title: "Please sign above the line", ID: "SignatureSignOnOffSignature", ElementId: getUniqID() },
            { Type: "Button.Add.Signature", Title: "Add Signature", ElementId: getUniqID() },
            { Type: "Register.Signatures", Title: "Signatures", ID: "SignatureSignOnOff", ElementId: getUniqID() }
          ])
          break

        default:
          addToCurrentSection(elementName)
          break
      }
    }

    // TableOfContent - must be first
    // if (elementName === "TableOfContent") addToNewSection(elementName)
    // else addToCurrentSection(elementName)

    // All SingleUse at the end, except signatureOnOff
    // Document Summary should be the very last

  }

  /**-------------------------------------------------**
  * @desc - Manage sections                       -----*
  *----------------------------------------------------*/

  function addToCurrentSection(pElement, pChildren) {
    // console.log('addToCurrentSection: ', pElement)

    // TODO: NEED AN INSERT AT FUNCTION -----------------------------------------------------------------------//

    let newElement
    if (pElement === "Matrix") newElement = getNewElement(pElement, true)
    else if (pElement === "Repeatable") newElement = getNewElement(pElement, false, true)
    else if (pElement === "SignatureSignOnOff") newElement = getNewElement(pElement, false, false, pChildren)
    else if (pElement === "QRScanner.List") newElement = getNewElement(pElement, false, false, pChildren)
    else newElement = getNewElement(pElement)

    console.log(`--->: addToCurrentSection -> newElement`, newElement)
    if (pElement === "Trilean.Label") initButtonsProperty(newElement)

    if (json.Sections[currentSectionIndex] !== undefined) {
      let currentElements = json.Sections[currentSectionIndex].Elements
      currentElements.push(newElement)
      setJson({ Sections: [...json.Sections] })
    }
    else {
      let currentSection
      currentSection = getNewSection()
      currentSection.Elements.push(newElement)
      setJson({ Sections: [...json.Sections, currentSection] })
      if (currentSectionIndex > 0) setCurrentSectionIndex(currentSectionIndex + 1)
    }
  }

  function addNewSection() {
    setJson({ Sections: [...json.Sections, getNewSection()] })
    if (json.Sections.length > 0) setCurrentSectionIndex(json.Sections.length)
  }

  function addToNewSection(pElement, pChildren) {
    let newSection = getNewSection()
    let newElement = getNewElement(pElement, false, false, pChildren)
    newSection.Elements.push(newElement)

    setJson({ Sections: [...json.Sections, newSection] })
    if (json.Sections.length > 0) setCurrentSectionIndex(json.Sections.length)
  }

  function prependToFirstSection(pElement, pDefaultValues) {

    const newElement = pDefaultValues
    let currentSection = json.Sections[currentSectionIndex]

    if (currentSection !== undefined) {
      const firstSection = json.Sections[0].Elements
      firstSection.unshift(newElement)

      setJson({ Sections: [...json.Sections] })
      setCurrentSectionIndex(0)
      setSelectedControl(newElement)
    }
    else {
      currentSection = getNewSection()
      currentSection.Elements.unshift(newElement)
      json.Sections.push(currentSection)
      setJson({ Sections: [...json.Sections] })
      setSelectedControl(newElement)
    }
  }

  // TODO - REMOVE IDs ON THE DUPLICATED SECTION CONTROLS -----------------------------------------------------//
  function duplicateSection() {

    if (json.Sections[currentSectionIndex] !== undefined) {
      // Deep copy
      let sectionToDuplicate = JSON.parse(JSON.stringify(json.Sections[currentSectionIndex]))

      sectionToDuplicate.SectionId = getUniqID(5)
      sectionToDuplicate.Title = `${json.Sections[currentSectionIndex].Title}-copy`
      sectionToDuplicate.Elements.forEach(item => {
        if (item.ElementId === undefined || item.ElementId.length > 0) item.ElementId = getUniqID(11)
        if (item.ID !== undefined) item.ID = `${item.ID}-copy`
        if (item.Elements) {
          item.Elements.forEach(subitem => {
            if (subitem.ElementId === undefined || subitem.ElementId.length > 0) subitem.ElementId = getUniqID(11)
            if (subitem.ID !== undefined) subitem.ID = `${subitem.ID}-copy`
            if (subitem.Elements) {
              subitem.Elements.forEach(subsubitem => {
                if (subsubitem.ID !== undefined) subsubitem.ID = `${subsubitem.ID}-copy`
                if (subsubitem.ElementId !== undefined) subsubitem.ElementId = getUniqID(11)
              })
            }

          })
        }
      })

      setJson({ Sections: [...json.Sections.slice(0, currentSectionIndex + 1), sectionToDuplicate, ...json.Sections.slice(currentSectionIndex + 1)] })
      setCurrentSectionIndex(currentSectionIndex + 1)
    }
  }

  function removeSection() {
    let sections = json.Sections.filter((section, index) => {
      if (index !== currentSectionIndex) return section
      return false
    })

    // console.log(json.Sections)
    // console.log(json.Sections.length)
    setCurrentSectionIndex(json.Sections.length - 2)
    setJson({ Sections: [...sections] })
  }

  function moveSectionLeft() {
    if (currentSectionIndex > 0) {
      const reorderedSections = json.Sections
      reorderedSections.splice(currentSectionIndex, 0, reorderedSections.splice(currentSectionIndex - 1, 1)[0])
      setCurrentSectionIndex(currentSectionIndex - 1)
      setJson({ Sections: [...reorderedSections] })
    }
  }

  function moveSectionRight() {
    if (currentSectionIndex + 1 < json.Sections.length) {
      const reorderedSections = json.Sections
      reorderedSections.splice(currentSectionIndex, 0, reorderedSections.splice(currentSectionIndex + 1, 1)[0])
      setCurrentSectionIndex(currentSectionIndex + 1)
      setJson({ Sections: [...reorderedSections] })
    }
  }

  /**-------------------------------------------------**
  * @desc - Utilities                             -----*
  *----------------------------------------------------*/

  function getNewSection() {
    return (
      {
        SectionId: getUniqID(5),
        Title: `Section ${json.Sections.length + 1 || 1}`,
        Elements: []
      }
    )
  }

  function getNewElement(pElement, pIsMatrix, pIsRepeatable, pChildren) {
    // Repeatable children length are not known
    const matrixElementsInit = [{
      Type: "GridRow",
      ElementId: "odkwm-mjq3n",
      Elements: [
        {}
      ]
    }]

    if (pIsMatrix) {
      return (
        {
          Type: pElement,
          ElementId: getUniqID(11),
          Columns: "1",
          Rows: "1",
          Elements: matrixElementsInit
        }
      )
    }
    if (pIsRepeatable) {
      return (
        {
          Type: pElement,
          ElementId: getUniqID(11),
          Elements: []
        }
      )
    }
    else {
      if (pChildren) {
        return (
          {
            Type: pElement,
            ElementId: getUniqID(11),
            Elements: pChildren
          }
        )
      }
      else {
        return (
          {
            Type: pElement,
            ElementId: getUniqID(11),
          }
        )
      }
    }
  }

  function getElementFromElementId(pElementID) {
    const currentSection = json.Sections[currentSectionIndex]
    let foundItem = {}

    currentSection.Elements.forEach(item => {
      if (item.hasOwnProperty('Elements')) {

        item.Elements.forEach(subitem => {
          if (subitem.hasOwnProperty('Elements')) {

            subitem.Elements.forEach(subsubitem => {
              if (subsubitem.ElementId === pElementID) {
                console.log('---> Trouvé subsubitem: ', subsubitem)
                foundItem = subsubitem
              }
            })

          }

          if (subitem.ElementId === pElementID) {
            console.log('---> Trouvé subitem: ', subitem)
            foundItem = subitem
          }

        })
      }

      if (item.ElementId === pElementID) {
        console.log('---> Trouvé item: ', item)
        foundItem = item
      }

    })
    return foundItem
  }

  function getElementsFromId(pID) {
    let foundItem = []
    json.Sections.forEach(section => {
      section.Elements.forEach(item => {
        if (item.hasOwnProperty('Elements')) {

          item.Elements.forEach(subitem => {
            if (subitem.hasOwnProperty('Elements')) {

              subitem.Elements.forEach(subsubitem => {
                if (subsubitem.ID === pID) {
                  console.log('---> Trouvé subsubitem: ', subsubitem)
                  foundItem.push(subsubitem)
                }
              })

            }

            if (subitem.ID === pID) {
              console.log('---> Trouvé subitem: ', subitem)
              foundItem.push(subitem)
            }

          })
        }

        if (item.ID === pID) {
          console.log('---> Trouvé item: ', item)
          foundItem.push(item)
        }

      })
    })

    return foundItem
  }

  function getCurrentSection() {
    return json.Sections[currentSectionIndex]
  }

  function deleteElementFromId(pElementID) {
    let jsonToUpdate = { ...json }
    console.log('---> deleteElementFromId: ', pElementID)
    setSelectedControl({ ElementId: 0 })
    // console.log('---> selectedControl:', selectedControl)

    const currentSection = jsonToUpdate.Sections[currentSectionIndex]

    currentSection.Elements.forEach((item, index) => {
      if (item.hasOwnProperty('Elements')) {

        item.Elements.forEach((subitem, subindex) => {
          if (subitem.hasOwnProperty('Elements')) {

            subitem.Elements.forEach((subsubitem, subsubindex) => {
              if (subsubitem.ElementId === pElementID) {
                console.log('---> subsubitem: ', subsubitem, subitem.Elements)
                // delete subitem[subsubindex]
                let elementsToFilter = [...subitem.Elements]
                const elementsIndex = elementsToFilter.findIndex(subsubitem => subsubitem.ElementId === pElementID)
                elementsToFilter[elementsIndex] = {}
                console.log(`--->: deleteElementFromId -> sub sub elementsToFilter`, elementsToFilter, elementsIndex)
                subitem.Elements = elementsToFilter
              }
            })

          }

          if (subitem.ElementId === pElementID) {
            console.log('---> Delete subitem: ', subitem, pElementID)
            // delete item[subindex]
            let elementsToFilter = [...item.Elements]
            // console.log('---> ',subitem.ElementId, pElementID, subitem.ElementId === pElementID)

            elementsToFilter = elementsToFilter.filter(subitem => subitem.ElementId !== pElementID)
            console.log(`--->: deleteElementFromId -> sub elementsToFilter`, elementsToFilter)
            item.Elements = elementsToFilter
          }

        })
      }

      if (item.ElementId === pElementID) {
        console.log('---> Delete item: ', item)
        // delete currentSection.Elements[index]
        const newElements = currentSection.Elements.filter(item => item.ElementId !== pElementID)
        // console.log(`--->: deleteElementFromId -> newElements: `, newElements)
        currentSection.Elements = newElements
      }

    })

    setJson(jsonToUpdate)

  }

  function getParentElementFromId(pElementID) {
    // console.log(`--->: getParentElementFromId -> element: `, pElementID)
    const currentSection = json.Sections[currentSectionIndex]
    let foundItem = {}

    currentSection.Elements.forEach(item => {
      if (item.hasOwnProperty('Elements')) {

        item.Elements.forEach(subitem => {
          if (subitem.hasOwnProperty('Elements')) {

            subitem.Elements.forEach(subsubitem => {
              if (subsubitem.ElementId === pElementID) {
                console.log('---> Trouvé subsubitem: ', subsubitem)
                foundItem = subitem
              }
            })

          }

          if (subitem.ElementId === pElementID) {
            console.log('---> Trouvé subitem: ', subitem)
            foundItem = item
          }

        })
      }

      if (item.ElementId === pElementID) {
        console.log('---> Trouvé item: ', item)
        foundItem = currentSection.Elements
      }

    })
    return foundItem
  }

  function validateId(pID) {
    console.log(`--->: validateId -> getElementsFromId(pID)`, getElementsFromId(pID))
    if (getElementsFromId(pID).length > 0) setIsValidId(false)
    else setIsValidId(true)
  }

  function initButtonsProperty(pElement) {
    const buttons = [{
      Button: "Yes",
      Label: "",
      BackgroundColor: "",
      BackgroundColorSelected: ""
    },{
      Button: "No",
      Label: "",
      BackgroundColor: "",
      BackgroundColorSelected: ""
    },{
      Button: "NA",
      Label: "",
      BackgroundColor: "",
      BackgroundColorSelected: ""
    }]
    pElement.Buttons = buttons
  }

  /**--------------------------------------------------**
   * @desc - Return building Panel                 -----*
   *----------------------------------------------------*/
  function getHTML() {
    if (json.Sections.length > 0) {
      let currentSectionToRender = json.Sections[currentSectionIndex]
      // console.log(`--->: getHTML -> currentSectionToRender`, currentSectionToRender)
      if (currentSectionToRender.Elements.length > 0) return currentSectionToRender.Elements.map(item => {
        // let html
        // html = getControl(item)
        // console.log(`--->: getHTML -> html: `, html)
        // if (item.Elements.length > 0) console.log('item.Elements:', item.Elements);
        // return html
        return getControl(item)
      })
    }
  }

  function getControl(pItem) {
    // console.log(`--->: getControl -> pItem`, pItem)
    let id = pItem.ElementId
    return <Control
      controlObj={pItem}
      selectedControl={selectedControl}
      onClickHandler={(control) => {
        // Select control from control's child
        if (control.ElementId) onSelectControlHandler(control)
        // Select control
        else onSelectControlHandler(pItem)
      }}
      moveUp={(control, pIsSubControl) => moveUpHandler(control, pIsSubControl)}
      moveDown={(control, pIsSubControl) => moveDownHandler(control, pIsSubControl)}
      delete={(control) => deleteHandler(control)}
      key={id} />
  }

  function onSelectControlHandler(pControl) {
    console.log(`--->: onSelectControlHandler -> pControl`, pControl)

    setSelectedControl(pControl)

    // const targetedControl = getElementFromElementId(pControl)
    // console.log('---> onSelectControlHandler targetedControl: ', targetedControl)

    // let selectedElement
    // json.Sections.forEach((section, sectionIndex) => {
    //   // console.log('---> Parse another section with elements: ', section.Elements)
    //   // Deep selecting issue here...?
    //   section.Elements.forEach((node, ElementIndex) => {
    //     if (node.ElementId === pControl.ElementId) {
    //       selectedElement = node
    //       // console.log(`${json.Sections.length} sections - Element found in section ${sectionIndex+1} ${node}`)
    //     }
    //   })
    // })
    // // console.log('selectedElement: ', selectedElement)
    // setSelectedControl(selectedElement)
  }

  /**-------------------------------------------------**
  * @desc - Build the HTML from JSON              -----*
  *----------------------------------------------------*/
  function onJsonChangeHandler(e) {
    let currentValue = JSON.parse(document.getElementById('json-output').value)
    setJson(currentValue)
  }

  /**-------------------------------------------------**
  * @desc - Build the Panels tabs                 -----*
  *----------------------------------------------------*/
  let sectionNavigation = () => {
    if (json.Sections.length > 0) {
      return json.Sections.map((section, index) => {
        let sectionTitle = (json.Sections[index] !== undefined) ? json.Sections[index].Title : ''
        return <button
          key={index}
          onClick={() => setCurrentSectionIndex(index)}
          className={`tab-section ${currentSectionIndex === index ? 'tab-active' : ''}`}
        >{sectionTitle}</button>
      })
    }
  }

  /**-------------------------------------------------**
  * @desc - Manipulate the JSON                   -----*
  *----------------------------------------------------*/

  function moveUpHandler(pControl, pIsSubControl) {
    const parentElement = getParentElementFromId(pControl.ElementId)
    moveElement(pControl, parentElement, 'moveUp', pIsSubControl)

  }
  function moveDownHandler(pControl, pIsSubControl) {
    const parentElement = getParentElementFromId(pControl.ElementId)
    moveElement(pControl, parentElement, 'moveDown', pIsSubControl)
  }

  function moveElement(pControl, pParentElement, pDirection, pIsSubControl) {
    const container = (!pIsSubControl) ? pParentElement : pParentElement.Elements

    const position = container.findIndex(item => item.ElementId === pControl.ElementId)
    switch (pDirection) {
      case 'moveUp':
        if (position > 0) {
          // console.log('---> moveUp ', pControl, ' in: ', container, ' at position: ', position)
          container.splice(position - 1, 0, container.splice(position, 1)[0])
        }
        break
      case 'moveDown':
        if (position < container.length - 1) {
          // console.log('---> moveDown ', pControl, ' in: ', container, ' at position: ', position)
          container.splice(position + 1, 0, container.splice(position, 1)[0])
        }
        break
      default:
        break
    }
    setJson({ ...json })
  }

  function deleteHandler(pControl) {

    deleteElementFromId(pControl.ElementId)

    // Parse the whole JSON to find the element, even if nested inside Matrix or Repeatable
    // let elementsToUpdate = jsonToUpdate.Sections[currentSectionIndex].Elements
    // console.log(`--->: deleteHandler -> elementsToUpdate before`, elementsToUpdate)
    // elementsToUpdate.filter(control => {
    //   console.log('------> ', control.ElementId !== pControl.ElementId)

    //   if (control.ElementId !== pControl.ElementId) return control
    //   console.log(`--->: deleteHandler -> control.ElementId vs pControl.ElementId`, control.ElementId, pControl.ElementId)
    // })
    // // elementsToUpdate.forEach(control => {
    // //   if (control.ElementId !== pControl.ElementId) delete pControl
    // // })
    // console.log('---> delete ', pControl, 'elementsToUpdate after ', elementsToUpdate)

    // setJson(jsonToUpdate)
  }

  /**-------------------------------------------------**
  * @desc - Build the properties Panel            -----*
  *----------------------------------------------------*/

  function getPropertiesPanel(pSelectedControl) {
    const basicPropertiesIDs = ["Document.Summary",
      "Document.Summary2",
      "Document.Summary3",
      "Document.Summary4"
    ]
    const buttonPropertiesIDs = ["Button.Submit.Register",
      "Button.View.Document",
      "Button.Closeout",
      "Button.Send.SMS",
      "Button.Send.Email",
      "Button.Add.Email",
      "Button.Add.SMS",
      "Button.Add.Signature"
    ]

    const signaturePropertiesIDs = ["Signature",
      "Signature.Date",
      "Signature.DateTime"
    ]

    const booleanPropertiesIDs = ["SingleBoolean",
      "Boolean"
    ]

    const imagePropertiesIDs = ["Image",
      "Image.Single"
    ]

    const qrscannerPropertiesIDs = ["QRScanner",
      "QRScanner.List"
    ]

    const globalProperties = <>
      <div className="properties-form-row">
        <label htmlFor="identifier">ID</label>
        <input type="text" name="identifier" id="identifier" value={selectedControl.ID || ''} onChange={(e) => setControlID(e)} />
      </div>
      <div className="properties-form-row">
        <label htmlFor="title">Title</label>
        <input type="text" name="title" id="title" value={selectedControl.Title || ''} onChange={(e) => setControlTitle(e)} />
      </div>
      <div className="properties-form-row">
        <label htmlFor="isvisible">IsVisible</label>
        <input type="checkbox" name="isvisible" id="isvisible" checked={Boolean(selectedControl.IsVisible) || false} onChange={(e) => setControlIsVisible(e)} />
      </div>
    </>

    //TEMPLATE
    // if (pSelectedControl.Type === "Template") {
    //   return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
    //     {globalProperties}
    //   </div>
    // }

    if (pSelectedControl.Type === "Repeatable") {
      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        {globalProperties}
      </div>
    }

    // console.log(`--->: getPropertiesPanel -> pSelectedControl`, pSelectedControl)
    // PANEL FOR SECTION
    if (pSelectedControl.Type === undefined) {
      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        <div className="properties-form-row">
          <label htmlFor="title">Title</label>
          <input type="text" name="title" id="title" value={selectedControl.Title || ''} onChange={(e) => setControlTitle(e)} />
        </div>
      </div>
    }

    if (basicPropertiesIDs.includes(pSelectedControl.Type)) {
      return <div id={`panel-${pSelectedControl.ElementId}`} className="properties-form">
        {globalProperties}
      </div>
    }

    if (booleanPropertiesIDs.includes(pSelectedControl.Type)) {
      return <div id={`panel-${pSelectedControl.ElementId}`} className="properties-form">
        {globalProperties}
        <div className="properties-form-row">
          <label htmlFor="entrytitle">EntryTitle</label>
          <input type="text" name="entrytitle" id="entrytitle" value={selectedControl.EntryTitle || ''} onChange={(e) => setControlEntryTitle(e)} />
        </div>
        <div className="properties-form-row">
          <label>Default Value</label>
          <div className="properties-form-row-container">
          <div className="properties-form-row-elements">
              <label htmlFor="yes">Yes</label>
              <input type="radio" name="value" id="yes" value="1" checked={selectedControl.Value === "1"} onChange={(e) => setControlValue(e)} />
              <label htmlFor="no">No</label>
              <input type="radio" name="value" id="no" value="2" checked={selectedControl.Value === "2"} onChange={(e) => setControlValue(e)} />
            </div>
          </div>
        </div>
        <div className="properties-form-row">
          <label htmlFor="details">Details</label>
          <input type="text" name="details" id="details" value={selectedControl.Details || ''} onChange={(e) => setControlDetails(e)} />
        </div>
        <div className="properties-form-row">
          <div className="properties-form-row-container">
            <label htmlFor="collapsible">Collapsible</label>
            <input type="checkbox" name="collapsible" id="collapsible" checked={Boolean(selectedControl.Collapsible) || false} onChange={(e) => setControlCollapsible(e)} />
            <label htmlFor="iscollapsed">IsCollapsed</label>
            <input type="checkbox" name="iscollapsed" id="iscollapsed" checked={Boolean(selectedControl.IsCollapsed) || false} onChange={(e) => setControlIsCollapsed(e)} />
          </div>
        </div>
        <div className="properties-form-row">
          <label htmlFor="commentvalue">Comment</label>
          <input type="text" name="commentvalue" id="commentvalue" value={selectedControl.CommentValue || ''} disabled={Boolean(!selectedControl.ShowComment) || false} onChange={(e) => setControlCommentValue(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="showcomment">Show Comment</label>
          <input type="checkbox" name="showcomment" id="showcomment" checked={Boolean(selectedControl.ShowComment) || false} onChange={(e) => setControlShowComment(e)} />
        </div>
      </div>
    }

    if (buttonPropertiesIDs.includes(pSelectedControl.Type)) {
      return <div id={`panel-${pSelectedControl.ElementId}`} className="properties-form">
        {/* <label htmlFor="title">Title</label>
        <input type="text" name="title" id="title" value={selectedControl.Title || ''} onChange={(e) => setControlTitle(e)} /> */}
          <div className="properties-form-row">
            <label htmlFor="isvisible">IsVisible</label>
            <input type="checkbox" name="isvisible" id="isvisible" checked={Boolean(selectedControl.IsVisible) || false} onChange={(e) => setControlIsVisible(e)} />
          </div>
          <div className="properties-form-row">
            <label htmlFor="isbuttondisabled">IsButtonDisabled</label>
            <input type="checkbox" name="isbuttondisabled" id="isbuttondisabled" checked={Boolean(selectedControl.IsButtonDisabled) || false} onChange={(e) => setControlIsButtonDisabled(e)} />
          </div>
      </div>
    }

    if (pSelectedControl.Type === "Matrix") {
      return <div id={`panel-${pSelectedControl.ElementId}`} className="properties-form">
          <div className="properties-form-row">
            <label htmlFor="identifier">ID</label>
            <input type="text" name="identifier" id="identifier" value={selectedControl.ID || ''} onChange={(e) => setControlID(e)} />
          </div>
          <div className="properties-form-row">
            <label htmlFor="columns">Columns</label>
            <input type="number" name="columns" id="columns" value={selectedControl.Columns || ''} onChange={(e) => setControlColumns(e)} />
          </div>
          <div className="properties-form-row">
            <label htmlFor="rows">Rows</label>
            <input type="number" name="rows" id="rows" value={selectedControl.Rows || ''} onChange={(e) => setControlRows(e)} />
          </div>
          <div className="properties-form-row">
            <label htmlFor="isvisible">IsVisible</label>
            <input type="checkbox" name="isvisible" id="isvisible" checked={Boolean(selectedControl.IsVisible) || false} onChange={(e) => setControlIsVisible(e)} />
          </div>
      </div>
    }

    if (pSelectedControl.Type === "Document.TableOfContents") {
      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        {globalProperties}
      </div>
    }

    if (pSelectedControl.Type === "API") {
      let keyWordsList = []
      if (selectedControl.Keywords !== undefined) {
          keyWordsList = selectedControl.Keywords.map((keyword, index) => {
          return <div className="properties-form-row-container keyword-row" key={index}>
            <div>{keyword}</div>
            <div onClick={() => deleteKeyword(keyword)}><FontAwesomeIcon
              icon={faTrashAlt}
              title="Remove"
            /></div>
          </div>
        })
      }
      else selectedControl.Keywords = []

      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        {globalProperties}
        <div className="properties-form-row">
          <label htmlFor="api">Api</label>
          <select name="api" id="api" value={selectedControl.Api || 0} onChange={(e) => setControlApi(e)}>
            <option value="Select an Api">Select an Api</option>
            <option value="ProjectContacts">- Project Contacts</option>
            <option value="GlobalContacts">- Global Contacts</option>
            <option value="ProjectCompany">- Project Company</option>
            <option value="ABS">- ABS</option>
            <option value="CBS">- CBS</option>
            <option value="DBS">- DBS</option>
            <option value="FBS">- FBS</option>
            <option value="TBS">- TBS</option>
            <option value="PBS">- PBS</option>
            <option value="PCBS">- PCBS</option>
            <option value="WBS">- WBS</option>
          </select>
        <div className="properties-form-row">
          <div className={`properties-form-row-container ${(selectedControl.Api !== "ProjectContacts") ? 'hidden' : ''}`}>
            <label htmlFor="includephonenumber">Include Phone Number</label>
            <input type="checkbox" name="includephonenumber" id="includephonenumber" checked={Boolean(selectedControl.IncludePhoneNumber) || false} onChange={(e) => setControlIncludePhoneNumber(e)} />
          </div>
          <div className={`properties-form-row-container ${(selectedControl.Api !== "ProjectContacts") ? 'hidden' : ''}`}>
            <label htmlFor="includeemail">Include Email</label>
            <input type="checkbox" name="includeemail" id="includeemail" checked={Boolean(selectedControl.IncludeEmail) || false} onChange={(e) => setControlIncludeEmail(e)} />
          </div>
          <div className={`properties-form-row-container ${(selectedControl.Api !== "ProjectCompany") ? 'hidden' : ''}`}>
            <label htmlFor="includetitle">Include Title</label>
            <input type="checkbox" name="includetitle" id="includetitle" checked={Boolean(selectedControl.IncludeTitle) || false} onChange={(e) => setControlIncludeTitle(e)} />
          </div>
          <div className={`properties-form-row-container ${(selectedControl.Api !== "ProjectCompany") ? 'hidden' : ''}`}>
            <label htmlFor="includebusinessnumber">Include Business Number</label>
            <input type="checkbox" name="includebusinessnumber" id="includebusinessnumber" checked={Boolean(selectedControl.IncludeBusinessNumber) || false} onChange={(e) => setControlIncludeBusinessNumber(e)} />
          </div>
          <div className={`properties-form-row-container ${(selectedControl.Api !== "ProjectCompany") ? 'hidden' : ''}`}>
            <label htmlFor="includeabbreviation">Include Abbreviation</label>
            <input type="checkbox" name="includeabbreviation" id="includeabbreviation" checked={Boolean(selectedControl.IncludeAbbreviation) || false} onChange={(e) => setControlIncludeAbbreviation(e)} />
          </div>
          <div className={`properties-form-row-container ${(selectedControl.Api !== "ProjectContacts" && selectedControl.Api !== "ProjectCompany"  && selectedControl.Api !== "GlobalContacts") ? '' : 'hidden'}`}>
            <label htmlFor="includetitle">Include Title</label>
            <input type="checkbox" name="includetitle" id="includetitle" checked={Boolean(selectedControl.IncludeTitle) || false} onChange={(e) => setControlIncludeTitle(e)} />
          </div>
          <div className={`properties-form-row-container ${(selectedControl.Api !== "ProjectContacts" && selectedControl.Api !== "ProjectCompany"  && selectedControl.Api !== "GlobalContacts") ? '' : 'hidden'}`}>
            <label htmlFor="includecode">Include Code</label>
            <input type="checkbox" name="includecode" id="includecode" checked={Boolean(selectedControl.IncludeCode) || false} onChange={(e) => setControlIncludeCode(e)} />
          </div>
        </div>
        </div>
        <div className="properties-form-row">
          <label htmlFor="validationmessage">Validation Message</label>
          <input type="text" name="validationmessage" id="validationmessage" value={selectedControl.ValidationMessage || ''} onChange={(e) => setControlValidationMessage(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="mandatory">Mandatory</label>
          <input type="checkbox" name="mandatory" id="mandatory" checked={Boolean(selectedControl.Mandatory) || false} onChange={(e) => setControlMandatory(e)} />
        </div>
        <div className="properties-form-row">
              <label htmlFor="keywords">Keywords</label>
          <div className="properties-form-row-container">
            <div>
              <input type="text" name="keywords" id="keywords" value={currentKeyword || ''} onChange={(e) => setCurrentKeyword(e.target.value)} />
            </div>
            <div>
              <button className="btn btn-primary no-margin" onClick={() => setControlKeywords()}>Add</button>
            </div>
          </div>
        </div>
        <div className="properties-form-row">
          {keyWordsList}
        </div>
      </div>
    }

    if (pSelectedControl.Type === "Checkbox") {
      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        {globalProperties}
        <div className="properties-form-row">
          <label htmlFor="commentvalue">Comment</label>
          <input type="text" name="commentvalue" id="commentvalue" value={selectedControl.CommentValue || ''} disabled={Boolean(!selectedControl.ShowComment) || false} onChange={(e) => setControlCommentValue(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="showcomment">Show Comment</label>
          <input type="checkbox" name="showcomment" id="showcomment" checked={Boolean(selectedControl.ShowComment) || false} onChange={(e) => setControlShowComment(e)} />
        </div>
        <div className="properties-form-row">
          <label>Default Value</label>
          <div className="properties-form-row-container">
            <div className="properties-form-row-elements">
              <label htmlFor="yes">Yes</label>
              <input type="radio" name="value" id="yes" value="1" checked={selectedControl.Value === "1"} onChange={(e) => setControlValue(e)} />
              <label htmlFor="no">No</label>
              <input type="radio" name="value" id="no" value="2" checked={selectedControl.Value === "2"} onChange={(e) => setControlValue(e)} />
            </div>
          </div>
        </div>
        <div className="properties-form-row">
          <label htmlFor="entrytitle">EntryTitle</label>
          <input type="text" name="entrytitle" id="entrytitle" value={selectedControl.EntryTitle || ''} onChange={(e) => setControlEntryTitle(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="hasunderLine">HasUnderLine</label>
          <input type="checkbox" name="hasunderLine" id="hasunderLine" checked={Boolean(selectedControl.HasUnderLine) || false} onChange={(e) => setControlHasUnderLine(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="details">Details</label>
          <input type="text" name="details" id="details" value={selectedControl.Details || ''} onChange={(e) => setControlDetails(e)} />
        </div>
        <div className="properties-form-row">
          <div className="properties-form-row-container">
            <label htmlFor="collapsible">Collapsible</label>
            <input type="checkbox" name="collapsible" id="collapsible" checked={Boolean(selectedControl.Collapsible) || false} onChange={(e) => setControlCollapsible(e)} />
            <label htmlFor="iscollapsed">IsCollapsed</label>
            <input type="checkbox" name="iscollapsed" id="iscollapsed" checked={Boolean(selectedControl.IsCollapsed) || false} onChange={(e) => setControlIsCollapsed(e)} />
          </div>
        </div>
      </div>
    }

    if (pSelectedControl.Type === "List.Multicontrol") {
      let dataList = []
      if (selectedControl.Data !== undefined) {
        dataList = selectedControl.Data.map((data, index) => {
          return <div className="properties-form-row-container keyword-row" key={index}>
            <div>{data}</div>
            <div onClick={() => deleteKeyword(data)}><FontAwesomeIcon
              icon={faTrashAlt}
              title="Remove"
            /></div>
          </div>
        })
      }
      else selectedControl.Data = []

      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        {globalProperties}
        <div className="properties-form-row">
          <label>Default Value</label>
          <div className="properties-form-row-container">
          <div className="properties-form-row-elements">
              <label htmlFor="yes">Yes</label>
              <input type="radio" name="value" id="yes" value="1" checked={selectedControl.Value === "1"} onChange={(e) => setControlValue(e)} />
              <label htmlFor="no">No</label>
              <input type="radio" name="value" id="no" value="2" checked={selectedControl.Value === "2"} onChange={(e) => setControlValue(e)} />
            </div>
          </div>
        </div>
        <div className="properties-form-row">
          <label htmlFor="data">Data</label>
          <div className="properties-form-row-container">
            <div>
              <input type="text" name="data" id="data" value={currentData || ''} onChange={(e) => setCurrentData(e.target.value)} />
            </div>
            <div>
              <button className="btn btn-primary no-margin" onClick={() => setControlData()}>Add</button>
            </div>
          </div>
        </div>
        <div className="properties-form-row">
          {dataList}
        </div>
      </div>
    }

    if (pSelectedControl.Type === "List.Single") {
      let dataList = []
      if (selectedControl.Data !== undefined) {
        dataList = selectedControl.Data.map((data, index) => {
          return <div className="properties-form-row-container keyword-row" key={index}>
            <div>{data}</div>
            <div onClick={() => deleteKeyword(data)}><FontAwesomeIcon
              icon={faTrashAlt}
              title="Remove"
            /></div>
          </div>
        })
      }
      else selectedControl.Data = []

      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        {globalProperties}
        <div className="properties-form-row">
          <label>Default Value</label>
          <div className="properties-form-row-container">
          <div className="properties-form-row-elements">
              <label htmlFor="yes">Yes</label>
              <input type="radio" name="value" id="yes" value="1" checked={selectedControl.Value === "1"} onChange={(e) => setControlValue(e)} />
              <label htmlFor="no">No</label>
              <input type="radio" name="value" id="no" value="2" checked={selectedControl.Value === "2"} onChange={(e) => setControlValue(e)} />
            </div>
          </div>
        </div>
        <div className="properties-form-row">
          <label htmlFor="data">Data</label>
          <div className="properties-form-row-container">
            <div>
              <input type="text" name="data" id="data" value={currentData || ''} onChange={(e) => setCurrentData(e.target.value)} />
            </div>
            <div>
              <button className="btn btn-primary no-margin" onClick={() => setControlData()}>Add</button>
            </div>
          </div>
        </div>
        <div className="properties-form-row">
          {dataList}
        </div>
      </div>
    }

    if (pSelectedControl.Type === "List.Multiple") {
      let dataList = []
      if (selectedControl.Data !== undefined) {
        dataList = selectedControl.Data.map((data, index) => {
          return <div className="properties-form-row-container keyword-row" key={index}>
            <div>{data}</div>
            <div onClick={() => deleteKeyword(data)}><FontAwesomeIcon
              icon={faTrashAlt}
              title="Remove"
            /></div>
          </div>
        })
      }
      else selectedControl.Data = []

      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        {globalProperties}
        <div className="properties-form-row">
          <label>Default Value</label>
          <div className="properties-form-row-container">
          <div className="properties-form-row-elements">
              <label htmlFor="yes">Yes</label>
              <input type="radio" name="value" id="yes" value="1" checked={selectedControl.Value === "1"} onChange={(e) => setControlValue(e)} />
              <label htmlFor="no">No</label>
              <input type="radio" name="value" id="no" value="2" checked={selectedControl.Value === "2"} onChange={(e) => setControlValue(e)} />
            </div>
          </div>
        </div>
        <div className="properties-form-row">
          <label htmlFor="data">Data</label>
          <div className="properties-form-row-container">
            <div>
              <input type="text" name="data" id="data" value={currentData || ''} onChange={(e) => setCurrentData(e.target.value)} />
            </div>
            <div>
              <button className="btn btn-primary no-margin" onClick={() => setControlData()}>Add</button>
            </div>
          </div>
        </div>
        <div className="properties-form-row">
          {dataList}
        </div>
      </div>
    }

    if (imagePropertiesIDs.includes(pSelectedControl.Type)) {
      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        {globalProperties}
        <div className="properties-form-row">
          <label htmlFor="size">Size</label>
          <select name="size" id="size" value={selectedControl.Size || 0} onChange={(e) => setControlSize(e)}>
            <option value=""></option>
            <option value="Thumbnail">Thumbnail</option>
            <option value="Small">Small</option>
            <option value="Medium">Medium</option>
            <option value="Large">Large</option>
          </select>
        </div>
        <div className="properties-form-row">
          <label htmlFor="galleryextrack">GalleryExtrack</label>
          <input type="checkbox" name="galleryextrack" id="galleryextrack" checked={Boolean(selectedControl.GalleryExtrack) || false} onChange={(e) => setControlGalleryExtrack(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="galleryphone">GalleryPhone</label>
          <input type="checkbox" name="galleryphone" id="galleryphone" checked={Boolean(selectedControl.GalleryPhone) || false} onChange={(e) => setControlGalleryPhone(e)} />
        </div>
      </div>
    }

    // QRScanner.List is a control itself...
    if (qrscannerPropertiesIDs.includes(pSelectedControl.Type)) {
      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        {globalProperties}
        <div className="properties-form-row">
          <label htmlFor="entrytitle">EntryTitle</label>
          <input type="text" name="entrytitle" id="entrytitle" value={selectedControl.EntryTitle || ''} onChange={(e) => setControlEntryTitle(e)} />
        </div>
      </div>
    }

    if (pSelectedControl.Type === "Label") {
      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        {globalProperties}
        <div className="properties-form-row">
          <label htmlFor="fontsize">FontSize</label>
          <input type="number" name="fontsize" id="fontsize" value={selectedControl.FontSize || 0} onChange={(e) => setControlFontSize(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="margin">Margin</label>
          <input type="number" name="margin" id="margin" value={selectedControl.Margin || 0} onChange={(e) => setControlMargin(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="fontattribute">FontAttributes</label>
          <select name="fontattribute" id="fontattribute" value={selectedControl.FontAttributes || 0} onChange={(e) => setControlFontAttributes(e)}>
            <option value=""></option>
            <option value="Bold">Bold</option>
            <option value="Italic">Italic</option>
          </select>
        </div>
        <div className="properties-form-row">
          <label htmlFor="hasunderLine">HasUnderLine</label>
          <input type="checkbox" name="hasunderLine" id="hasunderLine" checked={Boolean(selectedControl.HasUnderLine) || false} onChange={(e) => setControlHasUnderLine(e)} />
        </div>
      </div>
    }

    if (pSelectedControl.Type === "Text") {
      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        {globalProperties}
      </div>
    }

    if (pSelectedControl.Type === "Trilean") {
      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        {globalProperties}
        <div className="properties-form-row">
          <label htmlFor="details">Details</label>
          <input type="text" name="details" id="details" value={selectedControl.Details || ''} onChange={(e) => setControlDetails(e)} />
        </div>
        <div className="properties-form-row">
          <div className="properties-form-row-container">
            <label htmlFor="collapsible">Collapsible</label>
            <input type="checkbox" name="collapsible" id="collapsible" checked={Boolean(selectedControl.Collapsible) || false} onChange={(e) => setControlCollapsible(e)} />
            <label htmlFor="iscollapsed">IsCollapsed</label>
            <input type="checkbox" name="iscollapsed" id="iscollapsed" checked={Boolean(selectedControl.IsCollapsed) || false} onChange={(e) => setControlIsCollapsed(e)} />
          </div>
        </div>
        <div className="properties-form-row">
          <label htmlFor="entrytitle">EntryTitle</label>
          <input type="text" name="entrytitle" id="entrytitle" value={selectedControl.EntryTitle || ''} onChange={(e) => setControlEntryTitle(e)} />
        </div>
        <div className="properties-form-row">
          <label>Default Value</label>
          <div className="properties-form-row-container">
          <div className="properties-form-row-elements">
              <label htmlFor="yes">Yes</label>
              <input type="radio" name="value" id="yes" value="1" checked={selectedControl.Value === "1"} onChange={(e) => setControlValue(e)} />
              <label htmlFor="no">No</label>
              <input type="radio" name="value" id="no" value="2" checked={selectedControl.Value === "2"} onChange={(e) => setControlValue(e)} />
              <label htmlFor="na">Na</label>
              <input type="radio" name="value" id="na" value="3" checked={selectedControl.Value === "3"} onChange={(e) => setControlValue(e)} />
            </div>
          </div>
        </div>
        <div className="properties-form-row">
          <label htmlFor="hidena">Hide N/A</label>
          <input type="checkbox" name="hidena" id="hidena" checked={Boolean(selectedControl.HideNA) || false} onChange={(e) => setControlHideNA(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="commentvalue">Comment</label>
          <input type="text" name="commentvalue" id="commentvalue" value={selectedControl.CommentValue || ''} disabled={Boolean(!selectedControl.ShowComment) || false} onChange={(e) => setControlCommentValue(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="showcomment">Show Comment</label>
          <input type="checkbox" name="showcomment" id="showcomment" checked={Boolean(selectedControl.ShowComment) || false} onChange={(e) => setControlShowComment(e)} />
        </div>
      </div>
    }

    if (pSelectedControl.Type === "Trilean.Label") {
      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        {globalProperties}

        <div className="properties-form-row">
          <hr/>
          <label htmlFor="buttonyeslabel">Button Yes</label>
        </div>
        <div className="properties-form-row">
          <label htmlFor="buttonyeslabel">Label</label>
          <input type="text" name="buttonyeslabel" id="buttonyeslabel" value={selectedControl.Buttons[0].Label || ''} onChange={(e) => setControlButtonLabel(e, 0)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="bgcolor">Background Color</label>
          <input type="color" name="bgcolor" id="bgcolor" value={selectedControl.Buttons[0].BackgroundColor || ''} onChange={(e) => setControlBackgroundColor(e, 0)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="bgcolorselected">Background Color Selected</label>
          <input type="color" name="bgcolorselected" id="bgcolorselected" value={selectedControl.Buttons[0].BackgroundColorSelected || ''} onChange={(e) => setControlBackgroundColorSelected(e, 0)} />
        </div>
        <div className="properties-form-row">
          <hr/>
          <label htmlFor="buttonyeslabel">Button No</label>
        </div>
        <div className="properties-form-row">
          <label htmlFor="buttonyeslabel">Label</label>
          <input type="text" name="buttonyeslabel" id="buttonyeslabel" value={selectedControl.Buttons[1].Label || ''} onChange={(e) => setControlButtonLabel(e, 1)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="bgcolor">Background Color</label>
          <input type="color" name="bgcolor" id="bgcolor" value={selectedControl.Buttons[1].BackgroundColor || ''} onChange={(e) => setControlBackgroundColor(e, 1)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="bgcolorselected">Background Color Selected</label>
          <input type="color" name="bgcolorselected" id="bgcolorselected" value={selectedControl.Buttons[1].BackgroundColorSelected || ''} onChange={(e) => setControlBackgroundColorSelected(e, 1)} />
        </div>
        <div className="properties-form-row">
          <hr/>
          <label htmlFor="buttonyeslabel">Button NA</label>
        </div>
        <div className="properties-form-row">
          <label htmlFor="buttonyeslabel">Label</label>
          <input type="text" name="buttonyeslabel" id="buttonyeslabel" value={selectedControl.Buttons[2].Label || ''} onChange={(e) => setControlButtonLabel(e, 2)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="bgcolor">Background Color</label>
          <input type="color" name="bgcolor" id="bgcolor" value={selectedControl.Buttons[2].BackgroundColor || ''} onChange={(e) => setControlBackgroundColor(e, 2)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="bgcolorselected">Background Color Selected</label>
          <input type="color" name="bgcolorselected" id="bgcolorselected" value={selectedControl.Buttons[2].BackgroundColorSelected || ''} onChange={(e) => setControlBackgroundColorSelected(e, 2)} />
        </div>

        <div className="properties-form-row">
          <hr/>
          <label htmlFor="details">Details</label>
          <input type="text" name="details" id="details" value={selectedControl.Details || ''} onChange={(e) => setControlDetails(e)} />
        </div>
        <div className="properties-form-row">
          <div className="properties-form-row-container">
            <label htmlFor="collapsible">Collapsible</label>
            <input type="checkbox" name="collapsible" id="collapsible" checked={Boolean(selectedControl.Collapsible) || false} onChange={(e) => setControlCollapsible(e)} />
            <label htmlFor="iscollapsed">IsCollapsed</label>
            <input type="checkbox" name="iscollapsed" id="iscollapsed" checked={Boolean(selectedControl.IsCollapsed) || false} onChange={(e) => setControlIsCollapsed(e)} />
          </div>
        </div>
        <div className="properties-form-row">
          <label htmlFor="entrytitle">EntryTitle</label>
          <input type="text" name="entrytitle" id="entrytitle" value={selectedControl.EntryTitle || ''} onChange={(e) => setControlEntryTitle(e)} />
        </div>
        <div className="properties-form-row">
          <label>Default Value</label>
          <div className="properties-form-row-container">
          <div className="properties-form-row-elements">
              <label htmlFor="yes">Yes</label>
              <input type="radio" name="value" id="yes" value="1" checked={selectedControl.Value === "1"} onChange={(e) => setControlValue(e)} />
              <label htmlFor="no">No</label>
              <input type="radio" name="value" id="no" value="2" checked={selectedControl.Value === "2"} onChange={(e) => setControlValue(e)} />
              <label htmlFor="na">Na</label>
              <input type="radio" name="value" id="na" value="3" checked={selectedControl.Value === "3"} onChange={(e) => setControlValue(e)} />
            </div>
          </div>
        </div>
        <div className="properties-form-row">
          <label htmlFor="hidena">Hide N/A</label>
          <input type="checkbox" name="hidena" id="hidena" checked={Boolean(selectedControl.HideNA) || false} onChange={(e) => setControlHideNA(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="commentvalue">Comment</label>
          <input type="text" name="commentvalue" id="commentvalue" value={selectedControl.CommentValue || ''} disabled={Boolean(!selectedControl.ShowComment) || false} onChange={(e) => setControlCommentValue(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="showcomment">Show Comment</label>
          <input type="checkbox" name="showcomment" id="showcomment" checked={Boolean(selectedControl.ShowComment) || false} onChange={(e) => setControlShowComment(e)} />
        </div>
      </div>
    }

    if (signaturePropertiesIDs.includes(pSelectedControl.Type)) {
      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        {globalProperties}
        <div className="properties-form-row">
          <label htmlFor="entrytitle">EntryTitle</label>
          <input type="text" name="entrytitle" id="entrytitle" value={selectedControl.EntryTitle || ''} onChange={(e) => setControlEntryTitle(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="validationmessage">ValidationMessage</label>
          <input type="text" name="validationmessage" id="validationmessage" value={selectedControl.ValidationMessage || ''} onChange={(e) => setControlValidationMessage(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="mandatory">Mandatory</label>
          <input type="checkbox" name="mandatory" id="mandatory" checked={Boolean(selectedControl.Mandatory) || false} onChange={(e) => setControlMandatory(e)} />
        </div>
      </div>
    }

    if (pSelectedControl.Type === "Date") {
      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        {globalProperties}
        <div className="properties-form-row">
          <label htmlFor="AddHour">Add Day</label>
          <input type="number" name="Addday" id="addday" value={selectedControl.AddDay || 0} onChange={(e) => setControlAddDay(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="AddHour">Add Month</label>
          <input type="number" name="addmonth" id="addmonth" value={selectedControl.AddMonth || 0} onChange={(e) => setControlAddMonth(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="mandatory">Mandatory</label>
          <input type="checkbox" name="mandatory" id="mandatory" checked={Boolean(selectedControl.Mandatory) || false} onChange={(e) => setControlMandatory(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="datevalue">Date Value</label>
          <input type="date" name="datevalue" id="datevalue" value={selectedControl.DateValue || ''} onChange={(e) => setControlDateValue(e)} />
          {/* <input type="time"/> */}
        </div>
        <div className="properties-form-row">
          <label htmlFor="formatdatetime">Format DateTime</label>
          <select name="formatdatetime" id="formatdatetime" value={selectedControl.FormatDateTime || 0} onChange={(e) => setControlFormatDateTime(e)}>
            <option value=""></option>
            <option value="yyyy-MM-dd hh:mm tt">yyyy-MM-dd hh:mm tt</option>
            <option value="yyyy-MM-dd HH:mm">yyyy-MM-dd HH:mm</option>
            <option value="yyyy-MMM-dd hh:mm tt">yyyy-MMM-dd hh:mm tt</option>
            <option value="yyyy-MMM-dd HH:mm">yyyy-MMM-dd HH:mm</option>
            <option value="yy-MM-dd hh:mm tt">yy-MM-dd hh:mm tt</option>
            <option value="yy-MM-dd HH:mm">yy-MM-dd HH:mm</option>
            <option value="yy-MMM-dd hh:mm tt">yy-MMM-dd hh:mm tt</option>
            <option value="yy-MMM-dd HH:mm">yy-MMM-dd HH:mm</option>
          </select>
        </div>
        <div className="properties-form-row">
          <label htmlFor="islabelvisible">Is Label Visible</label>
          <input type="checkbox" name="islabelvisible" id="islabelvisible" checked={Boolean(selectedControl.IsLabelVisible) || false} onChange={(e) => setControlIsLabelVisible(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="validationmessage">Validation Message</label>
          <input type="text" name="validationmessage" id="validationmessage" value={selectedControl.ValidationMessage || ''} onChange={(e) => setControlValidationMessage(e)} />
        </div>
      </div>
    }
    if (pSelectedControl.Type === "Time") {
      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        {globalProperties}
        <div className="properties-form-row">
          <label htmlFor="AddHour">Add Hour</label>
          <input type="number" name="addhour" id="addhour" value={selectedControl.AddHour || 0} onChange={(e) => setControlAddHour(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="timevalue">Time Value</label>
          <input type="time" name="timevalue" id="timevalue" value={selectedControl.TimeValue || ''} onChange={(e) => setControlTimeValue(e)} />
          {/* <input type="time"/> */}
        </div>
        <div className="properties-form-row">
          <label htmlFor="formatdatetime">Format DateTime</label>
          <select name="formatdatetime" id="formatdatetime" value={selectedControl.FormatDateTime || 0} onChange={(e) => setControlFormatDateTime(e)}>
            <option value=""></option>
            <option value="yyyy-MM-dd hh:mm tt">yyyy-MM-dd hh:mm tt</option>
            <option value="yyyy-MM-dd HH:mm">yyyy-MM-dd HH:mm</option>
            <option value="yyyy-MMM-dd hh:mm tt">yyyy-MMM-dd hh:mm tt</option>
            <option value="yyyy-MMM-dd HH:mm">yyyy-MMM-dd HH:mm</option>
            <option value="yy-MM-dd hh:mm tt">yy-MM-dd hh:mm tt</option>
            <option value="yy-MM-dd HH:mm">yy-MM-dd HH:mm</option>
            <option value="yy-MMM-dd hh:mm tt">yy-MMM-dd hh:mm tt</option>
            <option value="yy-MMM-dd HH:mm">yy-MMM-dd HH:mm</option>
          </select>
        </div>
        <div className="properties-form-row">
          <label htmlFor="islabelvisible">Is Label Visible</label>
          <input type="checkbox" name="islabelvisible" id="islabelvisible" checked={Boolean(selectedControl.IsLabelVisible) || false} onChange={(e) => setControlIsLabelVisible(e)} />
        </div>
      </div>
    }
    if (pSelectedControl.Type === "DateTime") {
      return <div id={`panel-${pSelectedControl.SectionId}`} className="properties-form">
        {globalProperties}
        <div className="properties-form-row">
          <label htmlFor="AddHour">Add Hour</label>
          <input type="number" name="addhour" id="addhour" value={selectedControl.AddHour || 0} onChange={(e) => setControlAddHour(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="AddHour">Add Day</label>
          <input type="number" name="Addday" id="addday" value={selectedControl.AddDay || 0} onChange={(e) => setControlAddDay(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="AddHour">Add Month</label>
          <input type="number" name="addmonth" id="addmonth" value={selectedControl.AddMonth || 0} onChange={(e) => setControlAddMonth(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="mandatory">Mandatory</label>
          <input type="checkbox" name="mandatory" id="mandatory" checked={Boolean(selectedControl.Mandatory) || false} onChange={(e) => setControlMandatory(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="datetimevalue">DateTime Value</label>
          <input type="date" name="datetimevalue" id="datetimevalue" value={selectedControl.DateTimeValue || ''} onChange={(e) => setControlDateTimeValue(e)} />
          {/* <input type="time"/> */}
        </div>
        <div className="properties-form-row">
          <label htmlFor="formatdatetime">Format DateTime</label>
          <select name="formatdatetime" id="formatdatetime" value={selectedControl.FormatDateTime || 0} onChange={(e) => setControlFormatDateTime(e)}>
            <option value=""></option>
            <option value="yyyy-MM-dd hh:mm tt">yyyy-MM-dd hh:mm tt</option>
            <option value="yyyy-MM-dd HH:mm">yyyy-MM-dd HH:mm</option>
            <option value="yyyy-MMM-dd hh:mm tt">yyyy-MMM-dd hh:mm tt</option>
            <option value="yyyy-MMM-dd HH:mm">yyyy-MMM-dd HH:mm</option>
            <option value="yy-MM-dd hh:mm tt">yy-MM-dd hh:mm tt</option>
            <option value="yy-MM-dd HH:mm">yy-MM-dd HH:mm</option>
            <option value="yy-MMM-dd hh:mm tt">yy-MMM-dd hh:mm tt</option>
            <option value="yy-MMM-dd HH:mm">yy-MMM-dd HH:mm</option>
          </select>
        </div>
        <div className="properties-form-row">
          <label htmlFor="islabelvisible">Is Label Visible</label>
          <input type="checkbox" name="islabelvisible" id="islabelvisible" checked={Boolean(selectedControl.IsLabelVisible) || false} onChange={(e) => setControlIsLabelVisible(e)} />
        </div>
        <div className="properties-form-row">
          <label htmlFor="validationmessage">ValidationMessage</label>
          <input type="text" name="validationmessage" id="validationmessage" value={selectedControl.ValidationMessage || ''} onChange={(e) => setControlValidationMessage(e)} />
        </div>
      </div>
    }


  }
  function deleteKeyword(pKeyword) {
    const keywordIndex = selectedControl.Keywords.findIndex(item => item === pKeyword)
    delete selectedControl.Keywords[keywordIndex]
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }

  function setControlID(pEvent) {
    const IDvalue = pEvent.target.value
    validateId(IDvalue)

    selectedControl.ID = IDvalue
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlTitle(pEvent) {
    selectedControl.Title = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlHasUnderLine(pEvent) {
    selectedControl.HasUnderLine = pEvent.target.checked
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlIsVisible(pEvent) {
    selectedControl.IsVisible = pEvent.target.checked
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlFontSize(pEvent) {
    selectedControl.FontSize = Number(pEvent.target.value)
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlMargin(pEvent) {
    selectedControl.Margin = Number(pEvent.target.value)
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlFontAttributes(pEvent) {
    selectedControl.FontAttributes = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlSize(pEvent) {
    selectedControl.Size = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlApi(pEvent) {
    ["IncludeAbbreviation",
      "IncludePhoneNumber",
      "IncludeEmail",
      "IncludeTitle",
      "IncludeBusinessNumber",
      "IncludeTitle",
      "IncludeCode"
    ].forEach(option => {
      if (selectedControl[option]) delete selectedControl[option]
    })

    selectedControl.Api = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlEntryTitle(pEvent) {
    selectedControl.EntryTitle = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlDetails(pEvent) {
    selectedControl.Details = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlCommentValue(pEvent) {
    selectedControl.CommentValue = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlButtonLabel(pEvent, btnIndex) {
    selectedControl.Buttons[btnIndex].Label = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlBackgroundColor(pEvent, btnIndex) {
    selectedControl.Buttons[btnIndex].BackgroundColor = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlBackgroundColorSelected(pEvent, btnIndex) {
    selectedControl.Buttons[btnIndex].BackgroundColorSelected = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlValidationMessage(pEvent, btnIndex) {
    selectedControl.ValidationMessage = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlMandatory(pEvent) {
    selectedControl.Mandatory = pEvent.target.checked
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlAddHour(pEvent) {
    selectedControl.AddHour = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlAddDay(pEvent) {
    selectedControl.AddDay = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlAddMonth(pEvent) {
    selectedControl.AddMonth = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlDateTimeValue(pEvent) {
    selectedControl.DateTimeValue = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlFormatDateTime(pEvent) {
    selectedControl.FormatDateTime = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlIsLabelVisible(pEvent) {
    selectedControl.IsLabelVisible = pEvent.target.checked
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlDateValue(pEvent) {
    selectedControl.DateValue = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlTimeValue(pEvent) {
    selectedControl.TimeValue = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlIsButtonDisabled(pEvent) {
    selectedControl.IsButtonDisabled = pEvent.target.checked
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlShowComment(pEvent) {
    selectedControl.ShowComment = pEvent.target.checked
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }

  function setControlCollapsible(pEvent) {
    selectedControl.Collapsible = pEvent.target.checked
    if (!selectedControl.Collapsible) selectedControl.IsCollapsed = false
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlIsCollapsed(pEvent) {
    selectedControl.IsCollapsed = pEvent.target.checked
    if (selectedControl.IsCollapsed) selectedControl.Collapsible = true
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlValue(pEvent) {
    selectedControl.Value = pEvent.target.value
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlIncludePhoneNumber(pEvent) {
    selectedControl.IncludePhoneNumber = pEvent.target.checked
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlIncludeEmail(pEvent) {
    selectedControl.IncludeEmail = pEvent.target.checked
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlIncludeTitle(pEvent) {
    selectedControl.IncludeTitle = pEvent.target.checked
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlIncludeBusinessNumber(pEvent) {
    selectedControl.IncludeBusinessNumber = pEvent.target.checked
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlIncludeAbbreviation(pEvent) {
    selectedControl.IncludeAbbreviation = pEvent.target.checked
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlIncludeCode(pEvent) {
    selectedControl.IncludeCode = pEvent.target.checked
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlGalleryExtrack(pEvent) {
    selectedControl.GalleryExtrack = pEvent.target.checked
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlGalleryPhone(pEvent) {
    selectedControl.GalleryPhone = pEvent.target.checked
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlHideNA(pEvent) {
    selectedControl.HideNA = pEvent.target.checked
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlKeywords(pEvent) {
    if (selectedControl.Keywords === undefined || selectedControl.Keywords.length === 0){
      selectedControl.Keywords = []
    }
    selectedControl.Keywords.push(currentKeyword)
    setCurrentKeyword('')
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlData(pEvent) {
    if (selectedControl.Data === undefined || selectedControl.Data.length === 0){
      selectedControl.Data = []
    }
    selectedControl.Data.push(currentData)
    setCurrentData('')
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }

  // MATRIX
  function setControlColumns(pEvent) {
    selectedControl.Columns = pEvent.target.value

    setMatrixSize()
    // let gridRowElement = {Type: "GridRow", ElementID: getUniqID(), Elements: []}
    // if (selectedControl.Elements[0] === undefined) {
    //   selectedControl.Elements.push(gridRowElement)
    // }


    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }
  function setControlRows(pEvent) {
    selectedControl.Rows = pEvent.target.value
    setMatrixSize()


    // for (let index = 0; index < selectedControl.Rows; index++) {
    //   let gridRowElement = {Type: "GridRow", ElementID: getUniqID(), Elements: []}
    //   // Create the Array
    //   if (selectedControl.Elements === undefined) {
    //     selectedControl.Elements = new Array(selectedControl.Rows)
    //   }
    //   // Shorten the Array
    //   if (selectedControl.Elements[selectedControl.Rows -1]) {
    //     selectedControl.Elements = selectedControl.Elements.slice(0, selectedControl.Rows)
    //   }
    //   // selectedControl.Elements = new Array(selectedControl.Rows)
    //   if (selectedControl.Elements[index] === undefined) selectedControl.Elements[index] = gridRowElement

    // }
    let jsonToUpdate = { ...json }
    setJson(jsonToUpdate)
  }

  function setMatrixSize(pSize) {
    if (selectedControl.Elements === undefined) selectedControl.Elements = []

    for (let row = 0; row < selectedControl.Rows; row++) {
      const gridRowElement = { Type: "GridRow", ElementId: getUniqID(), Elements: [] }

      let isRowEmpty = false
      if (selectedControl.Elements[row] !== undefined) {
        if (Object.entries(selectedControl.Elements[row]).length === 0) isRowEmpty = true
      }
      console.log(`--->: setMatrixSize -> isRowEmpty`, isRowEmpty)
      if (isRowEmpty || selectedControl.Elements[row] === undefined) selectedControl.Elements[row] = gridRowElement

      for (let col = 0; col < selectedControl.Columns; col++) {
        // if (selectedControl.Elements[row][col] === undefined) selectedControl.Elements[row].Elements[col] = {}
        // or
        if (selectedControl.Elements[row].Elements[col] === undefined) selectedControl.Elements[row].Elements[col] = {}

      }
    }

    // Remove unwanted Gridrows
    if (selectedControl.Elements.length > selectedControl.Rows) {
      const activeRows = selectedControl.Elements.slice(0, selectedControl.Rows)
      selectedControl.Elements = activeRows
    }
    // Remove unwanted items in Gridrows
    selectedControl.Elements.forEach(gridrow => {
      const activeCols = gridrow.Elements.slice(0, selectedControl.Columns)
      gridrow.Elements = activeCols
    })
  }

  /**-------------------------------------------------**
  * @desc - JSON utilities functions              -----*
  *----------------------------------------------------*/
  function copyJsonHandler() {
    document.getElementById('json-output').select()
    document.execCommand('copy')
    console.log('JSON COPIED!')
  }

  function pasteJsonHandler() {
    const jsonOutput = document.getElementById('json-output')

    navigator.clipboard.readText()
      .then(text => {
        jsonOutput.value = text

        let pasteEvent = new Event('paste')
        onJsonChangeHandler(pasteEvent)
      })
      .catch(err => {
        // User didn't grant access to read from clipboard
        console.log('Something went wrong', err)
      })
  }

  function loadJsonHandler(pEvent) {
    let file = pEvent.target.files[0]
    let reader = new FileReader()

    reader.onloadend = function () {
      try {
        let source = reader.result
        let newData = null
        let newSource = source.replace("data:application/json;base64,", "")

        newData = JSON.parse(atob(newSource))
        newData.IsEnableToImport = false
        newData.isInValidFile = false
        setJson({ ...newData })
      }
      catch (err) {
        // error loading the json file
        console.log('---> ', err)
      }
    }
    if (file) {
      reader.readAsDataURL(file)
    }
  }

  function saveJsonHandler() {
    if (isValidId) {
      let element = document.createElement('a')
      element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(json)))
      let jsonFileName = "new_form"
      element.setAttribute('download', jsonFileName + '.json')
      element.style.display = 'none'
      document.body.appendChild(element)

      element.click()
      document.body.removeChild(element)
    }
  }

  function deleteJsonHandler() {
    setCurrentSectionIndex(0)

    if (window.confirm('Are you sure to remove all?')) {
      json.Sections = {}

      const newSection = getNewSection()
      setJson({ Sections: [newSection] })
      setSelectedControl(newSection)
    }
  }

  /**-------------------------------------------------**
  * @desc - UI methods                            -----*
  *----------------------------------------------------*/

  function simpleTabsHandler(pIndex) {
    switch (pIndex) {
      case 0:
        setMode('board')
        break
      case 1:
        setMode('preview')
        break
      default:
        break
    }
  }

  /**-------------------------------------------------**
  * @desc - Render the App                        -----*
  *----------------------------------------------------*/

  const boardEdit =
    <>
      <div className="section-controls">
        <div className="section-controls-group">
          <button onClick={() => addNewSection()} className="btn btn-secondary"><FontAwesomeIcon icon={faFolderPlus} />ADD SECTION</button>
          <button onClick={() => duplicateSection()} className="btn btn-secondary"><FontAwesomeIcon icon={faClone} />DUPLICATE SECTION</button>
          <button onClick={() => deleteJsonHandler()} className="btn btn-secondary"><FontAwesomeIcon icon={faExclamationTriangle} />CLEAR BOARD</button>
        </div>
      </div>
      <div className="section-tabs">
        {sectionNavigation()}
      </div>
      <div id="board-edit" onDragOver={onDragOverHandler} onDrop={onDropHandler}>
        <div className="section-inner-header">
          <div>
            <input
              type="text"
              onClick={() => onSelectControlHandler(getCurrentSection())}
              className="section-title" value={getCurrentSection().Title}
              readOnly
              placeholder="Section title"></input>
          </div>
          <div className="section-btn-group">
            <button onClick={() => moveSectionLeft()} className="btn btn-primary btn-small"><FontAwesomeIcon icon={faArrowLeft} />Move LEFT</button>
            <button onClick={() => removeSection()} className="btn btn-tertiary btn-small" disabled={!currentSectionIndex > 0}><FontAwesomeIcon icon={faTrash} />REMOVE SECTION</button>
            {/* {currentSectionIndex> 0 ? <button onClick={() => removeSection()} className="btn btn-tertiary btn-small"><FontAwesomeIcon icon={faTrash}/>REMOVE SECTION</button> : ''} */}
            <button onClick={() => moveSectionRight()} className="btn btn-primary btn-small btn-right-icon">Move RIGHT<FontAwesomeIcon icon={faArrowRight} /></button>
          </div>
        </div>
        {
          getHTML()
        }
      </div>

    </>

  const jsonPreview =
    <div id="json-preview">
      <ReactJson src={json} theme="monokai" displayDataTypes={false} iconStyle="square" enableClipboard={false} />
    </div>

  const errorDuplicate = (!isValidId) ? <div className="error-message">
    <FontAwesomeIcon icon={faExclamationCircle} />
    Duplicate ID detected. Control's ID value must be unique. Modify the duplicate ID to enable the Export Json option.
  </div> : ''

  let propertiesPanel =
    (mode === 'board') ?
      <div className="properties-panel-container">
        <h2>PROPERTIES</h2>
        {errorDuplicate}
        <div>{getPropertiesPanel(selectedControl)}</div>
      </div>
      : (mode === 'preview') ?
        <div id="edit-controls">
          <button onClick={() => document.getElementById('fileInput').click()} className="btn btn-primary"><FontAwesomeIcon icon={faUpload} />Import JSON</button>
          <button onClick={() => saveJsonHandler()} className="btn btn-tertiary"><FontAwesomeIcon icon={faFileCode} />Export JSON</button>
          <div>
            <input type="file"
              id="fileInput"
              className="custom-file-input"
              accept="application/JSON"
              onChange={e => loadJsonHandler(e)} />
          </div>
          <button onClick={() => copyJsonHandler()} className="btn btn-secondary"><FontAwesomeIcon icon={faCopy} />Copy JSON</button>
          <button onClick={() => pasteJsonHandler()} className="btn btn-secondary"><FontAwesomeIcon icon={faPaste} />Paste JSON</button>
        </div>
        :
        ''

  return (
    <div className="app">
      <header className="header">
        <h1>JSON Generator</h1>
      </header>
      <div id="page" className="page">

        <nav id="navigation" className="navigation">
          <div className="navigation-container">
            <div className="navigation-section">
              <div className="navigation-section-title">
                <FontAwesomeIcon icon={faCog} /><h2>Section Controls</h2>
              </div>
              <ul className="navigation-section-items" onDragStart={controlsHandler}>
                <li draggable id="Matrix">Matrix</li>
                <li draggable id="Matrixbutton">Matrix Button</li>
                <li draggable id="Repeatable">Repeatable</li>
              </ul>
            </div>

            <div className="navigation-section">
              <div className="navigation-section-title">
                <FontAwesomeIcon icon={faStream} /><h2>Template Controls</h2>
              </div>
              <ul className="navigation-section-items" onDragStart={controlsHandler}>
                <li draggable id="Document.TableOfContents">Table of content</li>
                <li draggable id="Document.Summary">D.Summary</li>
                <li draggable id="Document.Summary2">D.Summary (with Close)</li>
                <li draggable id="Document.Summary3">D.Summary (with Registers)</li>
                <li draggable id="Document.Summary4">D.Summary (Registers/Close)</li>
                <li draggable id="Emailregister">Email Register</li>
                <li draggable id="Smsregister">SMS Register</li>
                <li draggable id="QRScanner.List">QR Scanner List</li>
                <li draggable id="SignatureSignOnOff">Signature SignOnOff</li>
              </ul>
            </div>

            <div className="navigation-section">
              <div className="navigation-section-title">
                <FontAwesomeIcon icon={faLightbulb} /><h2>Type controls</h2>
              </div>
              <ul className="navigation-section-items" onDragStart={controlsHandler}>
                <li draggable id="API">API</li>
                <li draggable id="SingleBoolean">Boolean Single</li>
                <li draggable id="Boolean">Boolean Double</li>
                <li draggable id="Button.Add.ReportDate">Button Add Report Date</li>
                <li draggable id="Checkbox">Checkbox</li>
                <li draggable id="List.Multicontrol">Conditional Response</li>
                <li draggable id="Date">Date</li>
                <li draggable id="DateTime">DateTime</li>
                <li draggable id="Image">Image</li>
                <li draggable id="Image.Single">Image Single</li>
                <li draggable id="Label">Label</li>
                <li draggable id="List.Single">List Single</li>
                <li draggable id="List.Multiple">List Multiple</li>
                {/* <li draggable id="Numeric">Numeric</li> */}
                <li draggable id="QRScanner">QR Scanner</li>
                <li draggable id="Signature">Signature</li>
                <li draggable id="Signature.Date">Signature Date</li>
                <li draggable id="Signature.DateTime">Signature DateTime</li>
                <li draggable id="Text">Text</li>
                <li draggable id="Time">Time</li>
                <li draggable id="Trilean">Trilean</li>
                <li draggable id="Trilean.Label">Trilean Label</li>
                <li draggable id="Widgetevents">Widget Events</li>
                <li draggable id="Widgetdisplay">Widget Display</li>
                <li draggable id="Widgetdocketcontractor">Widget Docket Contractor</li>
                <li draggable id="Widgetdocketequipment">Widget Docket Equipment</li>
                <li draggable id="Widgetdocketphoto">Widget Docket Photo</li>
                <li draggable id="Widgetdocketcomments">Widget Docket Comments</li>
              </ul>
            </div>
          </div>
        </nav>

        <main>
          <div className="main-container">
            <SimpleTabs dispatchIndex={(pMode) => simpleTabsHandler(pMode)} tabs={[
              {
                tab: boardEdit,
                title: "Board"
              },
              {
                tab: jsonPreview,
                title: "Json Preview"
              }]} />
            <textarea id="json-output" cols="60" rows="14" value={JSON.stringify(json)} onChange={() => onJsonChangeHandler()}></textarea>
          </div>
        </main>

        <aside id="sidebar" className="sidebar">
          <span id="sidebarHandle"></span>
          <div id="properties-panel">{propertiesPanel}</div>
        </aside>

      </div>
    </div>
  )
}

export default App
