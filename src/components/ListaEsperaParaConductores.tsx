import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  List,
  Typography,
} from "@mui/material";
import { ChatRounded, DriveEtaRounded as LocIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { grey } from "@mui/material/colors";
import { User } from "../types";
import axios from "axios";

interface ColasDisponibles {
  id: string;
  email: string;
  nameU: string;
  lastname: string;
  liftID: string;
  photo: string;
  role: string;
}

interface SolicitudUsuarios {
  usuario: ColasDisponibles;
  solicitudes: ColasDisponibles[];
}

var elegidos: ColasDisponibles[] = [];

const ListaEsperaParaConductores = (): JSX.Element => {
  var requests: ColasDisponibles[] = [];

  const fetchUser = async () => {
    var requestsString = JSON.parse(localStorage.getItem("requests")!);
    requests = requestsString;
    console.log("arreglo de requests" + requests);
  };

  const navigate = useNavigate();

  function empezarViaje() {
    //aqui se debe pasar la lista de elegidos a la cola en proceso
    let j = 0;
    for (let i = 0; i < elegidos.length; i++) {
      var data = JSON.stringify({
        id: elegidos[i].id,
        dNumber: 1,
      });
      console.log(data);
      var config = {
        method: "post",
        url: "https://ulift-backend.up.railway.app/api/lift/accept",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios(config).then(function (response) {
        console.log(JSON.stringify(response.data.message));
        j++;
      });
    }

    setTimeout(() => {
      navigate("/colaEnProceso/conductor");
    }, 8000);
  }

  fetchUser();

  return (
    <Box display={"flex"} flexDirection="column" alignItems="center" justifyContent="center">
      {/* Cuando haya seleccionado al menos uno o el límite indicado y si es conductor , debe habilitarse esta opción */}

      <List dense sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
        {requests.map((user, index) => (
          <PasajeroListaEspera usuario={user} solicitudes={requests} key={index} />
        ))}
      </List>

      {requests.length > 0 && (
        <Button variant="contained" onClick={empezarViaje}>
          Empezar viaje
        </Button>
      )}
    </Box>
  );
};

export default ListaEsperaParaConductores;

export const PasajeroListaEspera = ({ usuario, solicitudes }: SolicitudUsuarios): JSX.Element => {
  const foto = "https://ulift-backend.up.railway.app/" + usuario.photo;
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  const handleClick = (id: string) => () => {
    if (isActive === false) {
      setIsActive((current) => !current);
      elegidos.push(solicitudes.find((usuario) => usuario.id === id) as ColasDisponibles);
      console.log(elegidos.flatMap((usuario) => usuario.nameU + " " + usuario.id));
    } else {
      if (solicitudes.find((usuario) => usuario.id === id)) {
        setIsActive((current) => !current);
        elegidos.splice(
          elegidos.indexOf(solicitudes.find((usuario) => usuario.id === id) as ColasDisponibles),
          1
        );
        console.log(elegidos.flatMap((usuario) => usuario.nameU + " " + usuario.id));
      }
    }

    // setIsActive(true);
  };
  const goChat = (id: string) => () => {
    navigate("/chatPrivado/" + id);
  };

  return (
    <Card
      sx={{
        width: "95%",
        height: "60px",
        backgroundColor: isActive ? "#40B4E5" : grey[100],
        color: isActive ? "white" : "",
        boxShadow: "none",
        p: 0,
        m: 0,
        mt: 1.5,
        borderRadius: 2,
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          boxShadow: "none",
          width: "100%",
          height: "60px",
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
      >
        <Box alignItems="center" mr={2} mt={1}>
          {/* Aquí se tiene que cambiar para colocar la imagen */}
          <Avatar sx={{ width: 50, height: 50 }} src={foto} />
        </Box>

        <Box
          sx={{
            width: "100%",
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontStyle: "bold",
            }}
          >
            {usuario.nameU} {usuario.lastname}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <IconButton sx={{ marginRight: 1 }} onClick={goChat(usuario.id)}>
            <ChatRounded color="primary" />
          </IconButton>
          <IconButton sx={{ marginRight: 1 }} onClick={handleClick(usuario.id)}>
            <LocIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};
