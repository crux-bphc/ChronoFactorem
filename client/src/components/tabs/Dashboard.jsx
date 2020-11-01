import React from "react"
import { connect } from "react-redux"
import { useGetData } from "use-axios-react"
import axios from "axios"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"
import { editTT } from "../../redux/actions/UpdateTimeTable"
import ShareTimeTable from "./ShareTimeTable"
import Typography from "@material-ui/core/Typography"
import Grid from "@material-ui/core/Grid"
import { makeStyles } from "@material-ui/core/styles"
import Card from "@material-ui/core/Card"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import Button from "@material-ui/core/Button"
import AlertBox from "../utils/AlertBox.jsx"
import { openSaveAlert } from "../../redux/actions/dialogs"
import "../../styles/Dashboard.css"

const useStyles = makeStyles({
  ttname: {
    minWidth: 250,
    margin: "1vh",
    float: "left",
  },
  cardcontainer: {
    width: "100%",
    maxWidth: "95vw",
    maxHeight: "30vh",
    overflow: "auto",
  },
  grid: {
    flexGrow: 1,
    maxWidth: "95vw",
    maxHeight: "26vh",
    overflow: "auto",
  },
  card: {
    margin: "1vh",
    width: "48%",
    backgroundColor: "#f0f0f0",
    float: "left",
    height: "40vw",
  },
})
const Dashboard = (props) => {
  const classes = useStyles()
  const [TTData, setTTData] = React.useState({
    savedTT: null,
  })
  const { savedTT } = TTData

  function deleteTT(id) {
    try {
      axios.delete(`/api/timetable/delete/${id}`).then((res) => {
        if (res.status === 200) {
          let newData = (savedTT || data).filter((item) => item._id !== id)
          setTTData({ savedTT: newData })
          props.openAlert("Successfully Deleted the Timetable", "success")
        } else {
          props.openAlert(res.data.msg + " Please Try Again Later", "error")
        }
      })
    } catch (err) {
      props.openAlert(
        "Couldn't Delete The TimeTable! Please Try Again Later.",
        "error"
      )
    }
  }

  function toggleShare(id, action) {
    try {
      axios.get(`/api/timetable/toggleShare/${id}`).then((res) => {
        if (res.status === 200) {
          let newData = []
          for (let item of savedTT || data) {
            if (item._id === id) {
              item.isShared = !item.isShared
            }
            newData.push(item)
          }
          setTTData({ savedTT: newData })
          props.openAlert(
            "Successfully " + action + " the Timetable",
            "success"
          )
        } else {
          props.openAlert(res.data.msg, "error")
        }
      })
    } catch (err) {
      props.openAlert("res.data.msg" + " Please Try Again Later", "error")
    }
  }
  let [data, loading] = useGetData("/api/timetable/getTT")

  if (!loading) {
    return (
      <>
        <AlertBox />
        <Card className={classes.card}>
          <div>
            <h4>Saved Timetables</h4>
          </div>
          <Grid container>
            {(TTData.savedTT || data).map((itemc) => {
              return (
                <Grid item>
                  <div key={itemc._id} id={itemc._id}>
                    <Card className={classes.ttname}>
                      <CardContent>
                        <h5>{itemc.name}</h5>
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
                            size="small"
                          >
                            Edit
                          </Button>
                        </Link>

                        <Button
                          onClick={() => {
                            deleteTT(itemc._id)
                          }}
                          variant="contained"
                          color="secondary"
                          size="small"
                        >
                          Delete
                        </Button>
                        {itemc.isShared ? (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              toggleShare(itemc._id, "Unshared")
                            }}
                          >
                            Unshare
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              toggleShare(itemc._id, "Shared")
                            }}
                          >
                            Share
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </div>
                </Grid>
              )
            })}
          </Grid>
        </Card>
        <Card className={classes.card}>
          <ShareTimeTable />
        </Card>
      </>
    )
  } else {
    return <h4>Fetching Latest Data....</h4>
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    editTT: (tt) => dispatch(editTT(tt)),
    openAlert: (msg, type) => dispatch(openSaveAlert(msg, type)),
  }
}

Dashboard.propTypes = {
  editTT: PropTypes.func.isRequired,
  openAlert: PropTypes.func.isRequired,
}

export default connect(null, mapDispatchToProps)(Dashboard)
