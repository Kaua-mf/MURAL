<?php

class Recado {
    private $conn;
    private $table_name = "recados";

    public $id;
    public $mensagem; 
    public $status; 
    public $data_criacao;
    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT id, mensagem, status, data_criacao 
                  FROM {$this->table_name} 
                  ORDER BY status DESC, data_criacao DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    public function getOne() {
        $query = "SELECT id, mensagem, status, data_criacao 
                  FROM {$this->table_name} 
                  WHERE id = :id 
                  LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $this->id);
        
        $stmt->execute();

        if($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->mensagem = $row['mensagem'];
            $this->status = $row['status'];
            $this->data_criacao = $row['data_criacao'];
            return true;
        }
        return false;
    }

    public function create($titulo, $conteudo) {
        $query = "INSERT INTO {$this->table_name} (mensagem, status) 
                  VALUES (:mensagem, 0)";
        
        $stmt = $this->conn->prepare($query);
        $clean_titulo = htmlspecialchars(strip_tags($titulo));
        $clean_conteudo = htmlspecialchars(strip_tags($conteudo));

        $this->mensagem = json_encode([
            'titulo' => $clean_titulo,
            'conteudo' => $clean_conteudo
        ]);

        $stmt->bindParam(':mensagem', $this->mensagem);

        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        return false;
    }

    public function update($titulo, $conteudo) {
        $query = "UPDATE {$this->table_name} 
                  SET mensagem = :mensagem 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);

        $clean_titulo = htmlspecialchars(strip_tags($titulo));
        $clean_conteudo = htmlspecialchars(strip_tags($conteudo));

        $this->mensagem = json_encode([
            'titulo' => $clean_titulo,
            'conteudo' => $clean_conteudo
        ]);

        $stmt->bindParam(':mensagem', $this->mensagem);
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function delete() {
        $query = "DELETE FROM {$this->table_name} WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    
    public function toggleFavorite() {
     
        $query = "UPDATE {$this->table_name} 
                  SET status = (status - 1) * -1 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(':id', $this->id);

        if($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>