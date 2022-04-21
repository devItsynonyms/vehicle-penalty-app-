
import { withStyles, makeStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';





export const useStyles = makeStyles({

    
    table: {
      minWidth: '700',
    },
  });
export const StyledTableCell = withStyles((theme) => ({
    head: {
      // backgroundColor: theme.palette.common.black,
      backgroundColor: '#595959',
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  }))(TableCell);
  
export const StyledTableRow = withStyles((theme) => ({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  }))(TableRow);