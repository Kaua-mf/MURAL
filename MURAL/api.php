<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once './config.php';
include_once './Database.php';
include_once './Recado.php';

function send_json_response($success, $message = '', $data = null) {
    $response = ['success' => $success];
    if ($message) {
        $response['message'] = $message;
    }
    if ($data) {
        $response['data'] = $data;
    }
    
    if (!$success) {
        http_response_code(isset($data['error_code']) ? $data['error_code'] : 500);
    } else {
        http_response_code(200);
    }
    
    echo json_encode($response);
    exit();
}

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    send_json_response(false, "Erro ao conectar ao banco de dados.", ['error_code' => 503]);
}

$recado = new Recado($db);

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $recado->id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
                if ($recado->id === false || $recado->id <= 0) {
                     send_json_response(false, "ID inválido.", ['error_code' => 400]);
                }
                
                if($recado->getOne()) {
                    $recado_item = [
                        "id" => $recado->id,
                        "mensagem" => $recado->mensagem, 
                        "status" => $recado->status,
                        "data_criacao" => $recado->data_criacao
                    ];
                    send_json_response(true, "Recado encontrado.", $recado_item);
                } else {
                    send_json_response(false, "Recado não encontrado.", ['error_code' => 404]);
                }
            } else {
                $stmt = $recado->getAll();
                $recados_arr = $stmt->fetchAll(PDO::FETCH_ASSOC);
                send_json_response(true, "Recados listados com sucesso.", $recados_arr);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"));

            if (!isset($data->action)) {
                send_json_response(false, "Ação não especificada.", ['error_code' => 400]);
            }

            if (in_array($data->action, ['update', 'delete', 'toggleFavorite'])) {
                if (!isset($data->id) || !filter_var($data->id, FILTER_VALIDATE_INT) || $data->id <= 0) {
                    send_json_response(false, "ID inválido ou ausente.", ['error_code' => 400]);
                }
                $recado->id = $data->id;
            }

            switch ($data->action) {
                case 'create':
                    if (empty($data->titulo) || empty($data->conteudo)) {
                        send_json_response(false, "Título e conteúdo são obrigatórios.", ['error_code' => 400]);
                    }
                    
                    if ($recado->create($data->titulo, $data->conteudo)) {
                        send_json_response(true, "Recado criado com sucesso.");
                    } else {
                        send_json_response(false, "Erro ao criar recado.");
                    }
                    break;

                case 'update':
                    if (empty($data->titulo) || empty($data->conteudo)) {
                        send_json_response(false, "Título e conteúdo são obrigatórios.", ['error_code' => 400]);
                    }

                    if ($recado->update($data->titulo, $data->conteudo)) {
                        send_json_response(true, "Recado atualizado com sucesso.");
                    } else {
                        send_json_response(false, "Erro ao atualizar recado.");
                    }
                    break;

                case 'delete':
                    if ($recado->delete()) {
                        send_json_response(true, "Recado excluído com sucesso.");
                    } else {
                        send_json_response(false, "Erro ao excluir recado.");
                    }
                    break;

                case 'toggleFavorite':
                    if ($recado->toggleFavorite()) {
                        send_json_response(true, "Status do favorito alterado.");
                    } else {
                        send_json_response(false, "Erro ao alterar status do favorito.");
                    }
                    break;

                default:
                    send_json_response(false, "Ação inválida.", ['error_code' => 400]);
                    break;
            }
            break;

        default:
            http_response_code(405);
            send_json_response(false, "Método não permitido.", ['error_code' => 405]);
            break;
    }
} catch (Exception $e) {
    error_log('Erro na API: ' . $e->getMessage());
    send_json_response(false, "Ocorreu um erro interno no servidor.");
}
?>