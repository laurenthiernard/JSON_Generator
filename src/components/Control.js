import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faWeight, faSpellCheck,
  faCalendarAlt, faTrashAlt,
  faAudioDescription, faToggleOn,
  faSortNumericUp, faGenderless,
  faImage, faImages, faListUl,
  faList, faFileAlt, faClock,
  faCheckSquare, faHandPointDown,
  faSearch, faCircle, faAd,
  faMailBulk, faPlus, faBars,
  faUserCircle, faTable, faLayerGroup,
  faEdit, faArrowUp, faArrowDown,
} from "@fortawesome/free-solid-svg-icons"

import { getUniqID } from './../utils'

export default function Control(props) {
  const id = props.controlObj.ElementId
  const type = props.controlObj.Type

  // const clickHandlerRef = props.onClickHandler

  // console.log(`--->: Control -> type`, props.controlObj)
  // console.log(`--->: Control -> props.selectedControl`, props.selectedControl)

  function getSubcontrols() {
    let subcontrolsHTMLElements = []

    switch (type) {
      case "Matrix":

        let cssRows = ''
        let cssColumns = ''

        for (let i = 0; i < props.controlObj.Rows; i++) {
          // let gridRowElement = {Type: "GridRow", ElementID: getUniqID(), Elements: []}
          // props.controlObj.Elements[i] = gridRowElement

          const rowElement = props.controlObj.Elements[i]
          // console.log(`--->: getSubcontrols -> rowElement`, rowElement)
          cssRows+='1fr '
          cssColumns = ''

          for (let j = 0; j < props.controlObj.Columns; j++) {
            const colElement = (rowElement.Elements !== undefined) ? rowElement.Elements[j] : {}
            // console.log(`--->: getSubcontrols -> new control: `, colElement)
            const newChildControl =
              <Control
                controlObj={colElement}
                selectedControl={props.selectedControl}
                isFixed={true}
                onClickHandler={() => props.onClickHandler(colElement)}
                // onClickHandler={() => props.onSelectControlHandler(colElement)}
                delete={(colElement) => props.delete(colElement)}
                key={colElement.ElementId} />
                // key={`matrix-sub${i}${j}`} />

            const slotContent = (Object.entries(colElement).length === 0 || colElement === undefined) ? 'Add control' : newChildControl
            // console.log(`--->: getSubcontrols -> slotContent`, slotContent)
            cssColumns+='1fr '
            subcontrolsHTMLElements.push(
              <div
                id={`${id}-matrix-row${i}-col${j}`}
                key={`matrix${i}${j}`}
                className="matrix-box">{slotContent}
              </div>)
          }
        }
        return <div className="control-footer" style={{display:'grid', gridTemplateColumns:cssColumns, gridTemplateRows:cssRows}}>{subcontrolsHTMLElements}</div>

      case "Repeatable":
      case "SignatureSignOnOff":
      case "Document.Summary2":
      case "Document.Summary3":
      case "Document.Summary4":
      case "Emailregister":
      case "Smsregister":
      case "Document.Summary":
        for (let i = 0; i < props.controlObj.Elements.length; i++) {
          const controlElement = props.controlObj.Elements[i]
          const newChildControl =
            <Control
              controlObj={controlElement}
              selectedControl={props.selectedControl}
              isFixed={false}
              onClickHandler={() => props.onClickHandler(controlElement)}
              moveUp={(controlElement) => props.moveUp(controlElement, true)}
              moveDown={(controlElement) => props.moveDown(controlElement, true)}
              delete={(controlElement) => props.delete(controlElement)}
              key={controlElement.ElementId} />

            // console.log(`--->: getSubcontrols -> newChildControl`, newChildControl)
            subcontrolsHTMLElements.push(newChildControl)
          }
          // console.log(`--->: getSubcontrols -> subcontrolsHTMLElements`, subcontrolsHTMLElements)
        // Repeatable
        const subcontrolsHTML = subcontrolsHTMLElements.map(element => element)

        // const slotContent = (Object.entries(colElement).length === 0 || colElement === undefined) ? 'Add control' : newChildControl
        return <>
            <div id={`${id}-repeatable-area`} className="control-footer-addarea">Add controls</div>
            <div id={`${id}-repeatable`} className="control-footer">{subcontrolsHTML}</div>
          </>

      // case "Document.Summary":
      // case "Document.Summary2":
      // case "Document.Summary3":
      // case "Document.Summary4":
      // case "Emailregister":
      // case "Smsregister":
      //   // console.log('---> ', props.controlObj.Elements)
      //   const children = props.controlObj.Elements.map(item => (
      //     <Control
      //       controlObj={item}
      //       selectedControl={props.selectedControl}
      //       isFixed={false}
      //       onClickHandler={() => props.onClickHandler(item)}
      //       // onClickHandler={() => props.onSelectControlHandler(colElement)}
      //       // delete={() => props.delete(item)}
      //       key={item.ElementId} />))
      //   return <div className="control-footer">{children}</div>

      default:
        break
    }
  }

  function getIcon(pType) {
    switch (pType) {
      case "Label":
      case "DocumentSummaryGrid":
        return faAudioDescription
      case "Document.TableOfContents":
      case "Document.Summary":
      case "Document.Summary2":
      case "Document.Summary3":
      case "Document.Summary4":
        return faFileAlt
      case "Button.Submit.Register":
      case "Button.View.Document":
      case "Button.Closeout":
      case "Button.Send.SMS":
      case "Button.Send.Email":
      case "Button.Add.Email":
      case "Button.Add.SMS":
      case "Button.Add.Signature":
      case "Button.Add.ReportDate":
        return faHandPointDown
      case "API":
      case "Signature.Date":
      case "Signature.DateTime":
        return faWeight
      case "SingleBoolean":
      case "Boolean":
        return faToggleOn
      case "Checkbox":
        return faCheckSquare
      case "List.Multicontrol":
        return faListUl
      case "Date":
      case "DateTime":
        return faCalendarAlt
      case "Image":
      case "Image.Single":
        return faImage
      case "QRScanner":
      case "QRScanner.List":
      case "Signature":
        return faSpellCheck
      case "Trilean":
        return faGenderless
      case "Trilean.Label":
        return faCircle
      case "Repeatable":
        return faBars
      default:
        return faTable
    }
  }

  const reorderable = (props.isFixed) ? '' : <div className="control-reordering">
    <FontAwesomeIcon icon={faArrowUp}
      onClick={() => props.moveUp(props.controlObj, false)}
    />
    <FontAwesomeIcon icon={faArrowDown}
      onClick={() => props.moveDown(props.controlObj, false)}
    />
  </div>

  return (
    <div
      id={id}
      className={`${props.isFixed ? 'subcontrol' : 'control'}${id === props.selectedControl.ElementId ? ' active-control' : ''}`}
      >
      <div className="control-header" onClick={props.onClickHandler}>{props.controlObj.Type}</div>
      <div className="control-content">
        {reorderable}
        <div className="control-icon" onClick={props.onClickHandler}>
          <FontAwesomeIcon icon={getIcon(props.controlObj.Type)} />
        </div>
        <div className="control-title" onClick={props.onClickHandler}>
          <input type={props.controlObj.Type.includes('Button') > 0 ? "button" : props.controlObj.Type.includes('Checkbox') ? "checkbox" : "text"} value={props.controlObj.Title || props.controlObj.Type || ''} disabled></input>
        </div>
        <div className="control-delete" onClick={() => props.delete(props.controlObj)}>
          <FontAwesomeIcon
            icon={faTrashAlt}
            title="Remove"
          /></div>
      </div>
      {getSubcontrols()}
    </div>
  )
}
