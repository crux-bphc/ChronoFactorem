import React, { useState } from "react"
import { Link } from "react-router-dom"
import Select from "react-select"
import { components } from "react-select"
import Typography from "@material-ui/core/Typography"
import Grid from "@material-ui/core/Grid"
import { makeStyles } from "@material-ui/core/styles"
import Card from "@material-ui/core/Card"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import Button from "@material-ui/core/Button"
import axios from "axios"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { useGetData } from "use-axios-react"
import "../../styles/ShareTT.css"
import { editTT } from "../../redux/actions/UpdateTimeTable"

const useStyles = makeStyles({
  root: {
    minWidth: 275,
    margin: "1vh",
  },
  /*
  cardcontainer: {
    maxWidth: '95vw',
    maxHeight: '65vh',
    overflow: 'auto',
  },*/
  content: {
    margin: "1vh",
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  grid: {
    flexGrow: 1,
    maxWidth: "95vw",
    maxHeight: "45vh",
    overflow: "auto",
  },
})

const branches = [
  { value: "BIO", label: "Biological Sciences" },
  { value: "CHE", label: "Chemical Engineering" },
  { value: "CHEM", label: "Chemistry" },
  { value: "CE", label: "Civil Engineering" },
  { value: "CS", label: "Computer Science" },
  { value: "ECO", label: "Economics & Finance" },
  { value: "ECE", label: "Electrical & Communication Engineering" },
  { value: "EEE", label: "Electrical & Electronics Engineering" },
  { value: "INSTR", label: "Electronics & Instrumentation Engineering" },
  { value: "MANU", label: "Manufacturing Engineering" },
  { value: "MATH", label: "Mathematics" },
  { value: "ME", label: "Mechanical Engineering" },
  { value: "PHA", label: "Pharmacy" },
  { value: "PHY", label: "Physics" },
]
const years = [
  { value: "1", label: "First" },
  { value: "2", label: "Second" },
  { value: "3", label: "Third" },
  { value: "4", label: "Fourth" },
  { value: "5", label: "Fifth" },
]

const ShareTimeTable = (props) => {
  const [formData, setFormData] = useState({
    branch: props.user
      ? branches.filter((branch) =>
          props.user["branch"].includes(branch["value"])
        )
      : [],
    year: props.user ? props.user.year.toString() : "",
    TTs: [],
  })

  const { branch, year, TTs } = formData

  const submitToMongo = (branch, year) => {
    let TTData = []
    try {
      let br = []
      branch.forEach((item) => {
        br.push(item["value"])
      })

      axios
        .get("/api/timetable/viewshared", {
          params: {
            branch: br,
            year: year,
          },
        })
        .then((resp) => {
          if (resp.status === 422 || resp.data.length === 0) {
            TTData = []
          } else if (resp.status !== 200) {
            throw new Error("Could not submit query")
          } else {
            TTData = JSON.parse(JSON.stringify(resp["data"]))
          }
          setFormData({ ...formData, TTs: TTData })
        })
    } catch (err) {
      window.alert(err.message)
    }
  }

  const handleBranchChange = (newBranch) => {
    setFormData({
      ...formData,
      branch: newBranch,
    })
  }
  const handleYearChange = (newYear) => {
    setFormData({
      ...formData,
      year: newYear,
    })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!branch || branch.length === 0) {
      window.alert("Please enter your branch")
    } else if (year.value === "" || isNaN(year.value)) {
      window.alert("Please enter your year")
    } else {
      submitToMongo(branch, year.value)
    }
  }

  const Menu = (props) => {
    const optionSelectedLength = props.getValue().length || 0
    return (
      <components.Menu {...props}>
        {optionSelectedLength < 2 ? (
          props.children
        ) : (
          <div className="wide-menu-row">
            You cannot select more than 2 branches
          </div>
        )}
      </components.Menu>
    )
  }
  const isValidNewOption = (inputValue, selectValue) =>
    inputValue.length > 0 && selectValue.length < 5

  const [, loading] = useGetData("/api/timetable/viewshared")
  const classes = useStyles()
  return (
    <>
      <div className={classes.content}>
        <h4 align="center">Publicly Shared Timetables</h4>
        <h5 align="center">Please Select your Branch and year below:</h5>
        <form className="form-whole" onSubmit={onSubmit}>
          <div className="branch-year-container">
            <Select
              components={{ Menu }}
              onChange={handleBranchChange}
              value={branch}
              isMulti
              isValidNewOption={isValidNewOption}
              options={branch && branch.length >= 2 ? branch : branches}
              className="left-width"
              placeholder="Select branch (select 2 branches for dual degree)"
            />
            <Select
              onChange={handleYearChange}
              value={year}
              isValidNewOption={isValidNewOption}
              options={years}
              className="left-width"
              placeholder="Select Year"
            />
            {/* <YearSelector
            onYearChange={handleYearChange}
            initialYear={year}
          ></YearSelector> */}
          </div>
          <br></br>
          <input type="submit" className="btn btn-primary" value="Go" />
          <br></br>
        </form>
        <br />
        <div>
          {!loading && TTs.length !== 0 ? (
            TTs.map((itemc) => {
              return (
                <Grid item xs={6}>
                  <div key={itemc._id} id={itemc._id}>
                    <Card className={classes.root}>
                      <CardContent>
                        <Typography variant="h5" component="h2">
                          {itemc.name}
                        </Typography>
                        <Typography color="textSecondary">Shared by</Typography>
                        {itemc.username}
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          component="p"
                        >
                          Date: {itemc.date.substr(0, itemc.date.indexOf("T"))}
                          <br />
                          {"Time: "}{" "}
                          {itemc.date.substr(itemc.date.indexOf("T") + 1, 9)}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Link
                          to="/create"
                          onClick={() => {
                            props.editTT(itemc)
                          }}
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            size="large"
                          >
                            View/Edit
                          </Button>
                        </Link>
                      </CardActions>
                    </Card>
                  </div>
                </Grid>
              )
            })
          ) : loading ? (
            <h4>Loading</h4>
          ) : (
            <h4>No Shared Timetables</h4>
          )}
        </div>
      </div>
    </>
  )
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    editTT: (tt) => dispatch(editTT(tt, true)),
  }
}

ShareTimeTable.propTypes = {
  editTT: PropTypes.func.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(ShareTimeTable)
